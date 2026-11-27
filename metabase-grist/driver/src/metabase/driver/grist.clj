(ns metabase.driver.grist
  "Metabase driver for Grist documents.

  A Grist document is a SQLite file, so this driver is a thin layer over Metabase's built-in `:sqlite` driver:

  * It never reads the live document. Metabase queries a local *snapshot*, refreshed at most every
    `refresh-seconds`, taken through the Grist REST API (`GET /api/docs/:docId/download`), or rebuilt from the
    records API so that Grist's access rules for the API key's user apply (`respect-access-rules`), or, for a mounted
    `.grist` file, with SQLite's online backup. Reading the live file directly holds SQLite locks that make Grist's own
    writes fail with `SQLITE_BUSY`.
  * Each query opens its own short-lived SQLite connection on the current snapshot, so a refreshed snapshot is seen at
    once (a pooled connection would keep reading the replaced file).
  * Sync describes the document from Grist's metadata (`_grist_Tables`, `_grist_Tables_column`) instead of SQLite's
    schema: internal tables and helper columns are hidden, Grist dates (stored as Unix seconds) become dates,
    references become foreign keys, and labels and formulas become field descriptions."
  (:require
   [clojure.java.io :as io]
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [metabase.driver :as driver]
   [metabase.driver.sql-jdbc.connection :as sql-jdbc.conn]
   [metabase.driver.sql-jdbc.execute :as sql-jdbc.execute]
   [metabase.driver.sql-jdbc.sync :as sql-jdbc.sync]
   [metabase.driver.sqlite]
   [metabase.util.json :as json]
   [metabase.util.log :as log])
  (:import
   (java.io File)
   (java.net URI URLEncoder)
   (java.net.http HttpClient HttpClient$Redirect HttpClient$Version HttpRequest HttpResponse HttpResponse$BodyHandlers)
   (java.nio.charset StandardCharsets)
   (java.nio.file CopyOption Files StandardCopyOption)
   (java.security MessageDigest)
   (java.sql Connection DriverManager PreparedStatement ResultSet ResultSetMetaData Types)
   (java.time Duration Instant LocalDate OffsetDateTime ZoneOffset)))

(set! *warn-on-reflection* true)

(driver/register! :grist, :parent #{:sqlite})

(defmethod driver/display-name :grist [_] "Grist")

(doseq [[feature supported?] {;; sync fields with `describe-table`, FKs with `describe-fks`
                              :describe-fields          false
                              :metadata/key-constraints true
                              ;; a snapshot is read-only
                              :table-privileges         false
                              :uploads                  false
                              :actions                  false
                              :database-routing         false}]
  (defmethod driver/database-supports? [:grist feature] [_driver _feature _db] supported?))

;;; ------------------------------------------------ Snapshots ---------------------------------------------------

(defn- cache-dir
  "Where snapshots are written. Must be readable by Metabase (see `MB_READABLE_PATHS`)."
  ^File []
  (doto (io/file (or (System/getenv "MB_GRIST_CACHE_DIR")
                     (str (System/getProperty "java.io.tmpdir") "/metabase-grist")))
    (.mkdirs)))

(defn- sha256 ^String [^String s]
  (let [digest (.digest (MessageDigest/getInstance "SHA-256") (.getBytes s StandardCharsets/UTF_8))]
    (apply str (map #(format "%02x" (bit-and % 0xff)) (take 12 digest)))))

(defn- source
  "The document `details` describe, as `{:kind :api ...}` or `{:kind :file ...}`."
  [{:keys [grist-url doc-id api-key doc-path respect-access-rules]}]
  (cond
    (not (str/blank? grist-url))
    (do (when (str/blank? doc-id)
          (throw (ex-info "Indiquez l'identifiant du document Grist." {:status-code 400})))
        {:kind    (if (contains? #{true "true"} respect-access-rules) :records :api)
         :url     (str/replace (str/trim grist-url) #"/+$" "")
         :doc-id  (str/trim doc-id)
         :api-key (some-> api-key str/trim not-empty)})

    (not (str/blank? doc-path))
    {:kind :file, :path (str/trim doc-path)}

    :else
    (throw (ex-info "Indiquez l'URL du serveur Grist (avec l'identifiant du document et une clé API) ou le chemin d'un fichier .grist."
                    {:status-code 400}))))

(defn- snapshot-file
  "One snapshot per document, mode *and API key*: two Metabase databases on the same document with different keys (so
  possibly different Grist rights) must never share a snapshot."
  ^File [src]
  (io/file (cache-dir) (str "grist-" (sha256 (pr-str src)) ".grist")))

(defn- sqlite-file? [^File f]
  (and (.isFile f)
       (with-open [in (io/input-stream f)]
         (let [header (byte-array 16)]
           (and (= 16 (.read in header))
                (= "SQLite format 3" (String. header 0 15 StandardCharsets/US_ASCII)))))))

(def ^:private ^HttpClient http-client
  (delay (-> (HttpClient/newBuilder)
             ;; Grist (Node) refuses the h2c upgrade Java tries by default on http:// URLs
             (.version HttpClient$Version/HTTP_1_1)
             (.connectTimeout (Duration/ofSeconds 10))
             (.followRedirects HttpClient$Redirect/NORMAL)
             (.build))))

(defn- grist-request ^HttpRequest [{:keys [url doc-id api-key]} ^String path]
  (.build (cond-> (-> (HttpRequest/newBuilder (URI. (str url "/api/docs/" (URLEncoder/encode ^String doc-id "UTF-8")
                                                         path)))
                      (.timeout (Duration/ofMinutes 5))
                      (.GET))
            api-key (.header "Authorization" (str "Bearer " api-key)))))

(defn- grist-error [status doc-id body]
  (ex-info (format "Grist a répondu %d pour le document %s : %s" status doc-id
                   (subs (str body) 0 (min 300 (count (str body)))))
           {:status-code 400, :grist-status status}))

(defn- download! [{:keys [doc-id] :as src} ^File dest]
  (let [^HttpResponse response (.send ^HttpClient @http-client
                                      (grist-request src "/download?nohistory=true&template=false")
                                      (HttpResponse$BodyHandlers/ofFile (.toPath dest)))]
    (when-not (= 200 (.statusCode response))
      (let [body (try (slurp dest) (catch Exception _ ""))]
        (.delete dest)
        (throw (grist-error (.statusCode response) doc-id body))))))

;;; Snapshot rebuilt from the records API: Grist applies the access rules of the API key's user to tables, columns and
;;; rows, so the snapshot holds exactly what that user sees in Grist (and nothing of Grist's metadata or history).

(defn- api-json
  "GET `path` of the document as decoded JSON (string keys), or nil when Grist's access rules hide it (403)."
  [{:keys [doc-id] :as src} path]
  (let [^HttpResponse response (.send ^HttpClient @http-client (grist-request src path)
                                      (HttpResponse$BodyHandlers/ofString StandardCharsets/UTF_8))
        status (.statusCode response)]
    (cond
      (= 200 status) (json/decode (.body response))
      (and (= 403 status) (not= path "/tables")) nil
      :else (throw (grist-error status doc-id (.body response))))))

(defn- sql-type [^String grist-type]
  (case (first (str/split grist-type #":" 2))
    "Date"            "DATE"
    "DateTime"        "TIMESTAMP"
    ("Int" "Ref" "Id") "INTEGER"
    "Numeric"         "NUMERIC"
    "Bool"            "BOOLEAN"
    "Any"             "BLOB"
    "TEXT"))

(defn- cell-value
  "A records API value as stored in a .grist file: lists (`[\"L\", ...]`) as JSON, booleans as 0/1, and errors or
  censored cells (`[\"E\", ...]`, `[\"C\"]`) as NULL."
  [v]
  (cond
    (boolean? v)    (if v 1 0)
    (sequential? v) (when (= "L" (first v)) (json/encode (vec (rest v))))
    (map? v)        (json/encode v)
    :else           v))

(defn- quote-id ^String [^String id]
  (str "\"" (str/replace id "\"" "\"\"") "\""))

(defn- build-from-records! [src ^File dest]
  (let [tables (get (api-json src "/tables") "tables")]
    (with-open [conn (DriverManager/getConnection (str "jdbc:sqlite:" (.getAbsolutePath dest)))]
      (.setAutoCommit conn false)
      (with-open [stmt (.createStatement conn)]
        (.executeUpdate stmt "CREATE TABLE _grist_Tables (id INTEGER PRIMARY KEY, tableId TEXT)")
        (.executeUpdate stmt (str "CREATE TABLE _grist_Tables_column (id INTEGER PRIMARY KEY, parentId INTEGER,"
                                  " parentPos NUMERIC, colId TEXT, type TEXT, label TEXT, isFormula INTEGER,"
                                  " formula TEXT, description TEXT)")))
      (doseq [[table-pos table] (map-indexed vector tables)
              :let [table-id ^String (get table "id")
                    path     (str "/tables/" (URLEncoder/encode table-id "UTF-8"))
                    columns  (some-> (api-json src (str path "/columns")) (get "columns"))
                    records  (when columns (some-> (api-json src (str path "/records")) (get "records")))]
              ;; a table the user cannot read is left out entirely
              :when (some? records)
              :let [seen    (into #{} (mapcat #(keys (get % "fields"))) records)
                    ;; only columns the records actually carry: a column hidden by an access rule never appears
                    columns (cond->> columns (seq records) (filter #(contains? seen (get % "id"))))
                    col-ids (mapv #(get % "id") columns)]]
        (with-open [stmt (.createStatement conn)]
          (.executeUpdate stmt (str "CREATE TABLE " (quote-id table-id) " (id INTEGER PRIMARY KEY"
                                    (apply str (for [c columns]
                                                 (str ", " (quote-id (get c "id")) " "
                                                      (sql-type (get-in c ["fields" "type"])))))
                                    ")")))
        (with-open [^PreparedStatement ps (.prepareStatement conn "INSERT INTO _grist_Tables VALUES (?, ?)")]
          (.setObject ps 1 (inc table-pos))
          (.setObject ps 2 table-id)
          (.executeUpdate ps))
        (with-open [^PreparedStatement ps (.prepareStatement
                                           conn "INSERT INTO _grist_Tables_column VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)")]
          (doseq [[i c] (map-indexed vector columns)
                  :let [f (get c "fields")]]
            (doseq [[j v] (map-indexed vector [(inc table-pos) i (get c "id") (get f "type") (get f "label")
                                               (if (get f "isFormula") 1 0) (get f "formula") (get f "description")])]
              (.setObject ps (inc j) v))
            (.executeUpdate ps)))
        (with-open [^PreparedStatement ps (.prepareStatement
                                           conn (str "INSERT INTO " (quote-id table-id) " VALUES (?"
                                                     (apply str (repeat (count col-ids) ", ?")) ")"))]
          (doseq [r records]
            (.setObject ps 1 (get r "id"))
            (doseq [[j col-id] (map-indexed vector col-ids)]
              (.setObject ps (+ 2 j) (cell-value (get-in r ["fields" col-id]))))
            (.addBatch ps))
          (.executeBatch ps)))
      (.commit conn))))

(defn- backup-file!
  "Copy the mounted `.grist` file with SQLite's online backup, which holds the source's read lock only briefly and
  gives a consistent copy even while Grist writes to it."
  [{:keys [path]} ^File dest]
  (let [src (io/file path)]
    (when-not (sqlite-file? src)
      (throw (ex-info (str "Pas un document Grist lisible : " path) {:status-code 400})))
    (with-open [conn (DriverManager/getConnection (str "jdbc:sqlite:file:" (.getAbsolutePath src) "?mode=ro"))
                stmt (.createStatement conn)]
      (.executeUpdate stmt (str "backup to " (.getAbsolutePath dest))))))

(defonce ^:private refreshed-at (atom {}))

(defn- fetch-snapshot! [src ^File target]
  (let [tmp (File/createTempFile "grist-" ".part" (cache-dir))]
    (try
      (case (:kind src)
        :api     (download! src tmp)
        :records (do (.delete tmp) (build-from-records! src tmp))
        :file    (backup-file! src tmp))
      (when-not (sqlite-file? tmp)
        (throw (ex-info "La réponse de Grist n'est pas un document SQLite." {:status-code 400})))
      ;; atomic: queries running on the previous snapshot keep reading it until they close their connection
      (Files/move (.toPath tmp) (.toPath target)
                  (into-array CopyOption [StandardCopyOption/REPLACE_EXISTING StandardCopyOption/ATOMIC_MOVE]))
      (finally (.delete tmp)))))

(defn- ensure-snapshot!
  "Path of an up-to-date snapshot of the document `details` describe, refreshing it when older than
  `refresh-seconds`. If a refresh fails while a previous snapshot exists, keeps serving the previous one."
  ^String [details]
  (let [src     (source details)
        target  (snapshot-file src)
        ttl-ms  (* 1000 (max 0 (or (some-> (:refresh-seconds details) str str/trim not-empty parse-long) 60)))
        k       (.getPath target)
        fresh?  #(and (.exists target)
                      (< (- (System/currentTimeMillis) (get @refreshed-at k 0)) ttl-ms))]
    (when-not (fresh?)
      (locking (.intern k)
        (when-not (fresh?)
          (try
            (fetch-snapshot! src target)
            (swap! refreshed-at assoc k (System/currentTimeMillis))
            (log/infof "Grist snapshot refreshed: %s -> %s" (or (:doc-id src) (:path src)) k)
            (catch Throwable e
              (cond
                ;; access revoked or key invalid: fail closed, never keep serving data the key may no longer see
                (#{401 403 404} (:grist-status (ex-data e)))
                (do (.delete target)
                    (swap! refreshed-at dissoc k)
                    (throw e))

                ;; Grist unreachable or failing: keep serving the previous snapshot
                (.exists target)
                (log/warnf e "Grist snapshot refresh failed, serving the previous one: %s" k)

                :else (throw e)))))))
    k))

;;; ------------------------------------------------ Connections -------------------------------------------------

(defmethod driver/validate-db-details! :grist
  [_driver details]
  (source details)
  nil)

(defmethod driver/connection-hosts :grist
  [_driver {:keys [grist-url]}]
  (if-let [host (some-> grist-url str/trim not-empty URI. .getHost)]
    [host]
    []))

(defmethod driver/connection-parameter-hosts :grist
  [_driver _details]
  [])

(defmethod sql-jdbc.conn/connection-details->spec :grist
  [_driver details]
  ;; The SQLite driver's spec, on the snapshot, read-only, with its protections (no ATTACH, no extensions).
  ((get-method sql-jdbc.conn/connection-details->spec :sqlite)
   :sqlite
   (-> details
       (dissoc :grist-url :doc-id :api-key :doc-path :refresh-seconds :respect-access-rules)
       (assoc :db (ensure-snapshot! details) :read-only? true))))

(defmethod driver/can-connect? :grist
  [driver details]
  (sql-jdbc.conn/can-connect-with-spec? (sql-jdbc.conn/connection-details->spec driver details)))

(defn- database-details [db-or-id]
  (:details (if (integer? db-or-id)
              ((requiring-resolve 'metabase.driver.util/lib-database) db-or-id)
              db-or-id)))

(defmethod sql-jdbc.execute/do-with-connection-with-options :grist
  [driver db-or-id-or-spec options f]
  ;; A new connection on the latest snapshot for each call, instead of a pooled one that would keep reading the
  ;; snapshot it was opened on. Opening a SQLite file takes about a millisecond.
  (let [spec (if (and (not (:connection db-or-id-or-spec))
                      (or (integer? db-or-id-or-spec) (:lib/type db-or-id-or-spec)))
               (sql-jdbc.conn/connection-details->spec driver (database-details db-or-id-or-spec))
               db-or-id-or-spec)]
    ((get-method sql-jdbc.execute/do-with-connection-with-options :sqlite) driver spec options f)))

;;; -------------------------------------------------- Sync ------------------------------------------------------

(defn- query [driver database sql]
  (sql-jdbc.execute/do-with-connection-with-options
   driver database nil
   (fn [^Connection conn]
     (jdbc/query {:connection conn} [sql]))))

(defn- grist-columns
  "Grist's description of every user column, in the order Grist shows them."
  [driver database]
  (let [has-description? (some #(= "description" (:name %))
                               (query driver database "PRAGMA table_info('_grist_Tables_column')"))]
    (query driver database
           (str "SELECT t.tableId AS table_id, c.colId AS col_id, c.type AS type, c.label AS label,"
                " c.isFormula AS is_formula, c.formula AS formula"
                (if has-description? ", c.description AS description" ", NULL AS description")
                " FROM _grist_Tables_column c JOIN _grist_Tables t ON t.id = c.parentId"
                " WHERE c.colId NOT LIKE 'gristHelper\\_%' ESCAPE '\\' AND c.type NOT IN ('ManualSortPos', 'PositionNumber')"
                " ORDER BY t.tableId, c.parentPos, c.id"))))

(defmethod driver/describe-database* :grist
  [driver database]
  {:tables (set (for [{:keys [table_id]} (query driver database "SELECT tableId AS table_id FROM _grist_Tables")
                      :when (not (str/blank? table_id))]
                  {:name table_id, :schema nil, :description nil}))})

(defn- grist-type->field
  "Metabase base type, semantic type and coercion for a Grist column type."
  [^String grist-type]
  (let [kind (first (str/split grist-type #":" 2))]
    (case kind
      "Text"        {:base-type :type/Text}
      "Choice"      {:base-type :type/Text, :semantic-type :type/Category}
      "Numeric"     {:base-type :type/Float}
      "Int"         {:base-type :type/Integer}
      "Bool"        {:base-type :type/Boolean}
      ;; Unix seconds at midnight UTC
      "Date"        {:base-type :type/Integer, :effective-type :type/Instant
                     :coercion-strategy :Coercion/UNIXSeconds->DateTime}
      ;; Unix seconds, possibly fractional
      "DateTime"    {:base-type :type/Decimal, :effective-type :type/Instant
                     :coercion-strategy :Coercion/UNIXSeconds->DateTime}
      "Ref"         {:base-type :type/Integer}
      ("RefList" "ChoiceList" "Attachments")
      {:base-type :type/Text, :semantic-type :type/SerializedJSON}
      "Id"          {:base-type :type/Integer}
      "Blob"        {:base-type :type/*}
      ;; "Any": formula results of any type, mostly text
      {:base-type :type/Text})))

(defn- field-comment [{:keys [label col_id is_formula formula description]}]
  (some->> [(when (and (not (str/blank? label)) (not= label col_id)) label)
            (not-empty description)
            (when (and (= 1 is_formula) (not (str/blank? formula))) (str "Formule : " formula))]
           (remove str/blank?)
           seq
           (str/join " — ")))

(defmethod driver/describe-table :grist
  [driver database {table-name :name}]
  (let [cols (filter #(= table-name (:table_id %)) (grist-columns driver database))]
    {:name   table-name
     :schema nil
     :fields (set (cons {:name "id", :database-type "Id", :base-type :type/Integer, :pk? true
                         :semantic-type :type/PK, :database-position 0}
                        (map-indexed
                         (fn [i {:keys [col_id type] :as col}]
                           (merge {:name              col_id
                                   :database-type     type
                                   :database-position (inc i)}
                                  (grist-type->field type)
                                  (when-let [comment (field-comment col)]
                                    {:field-comment comment})))
                         cols)))}))

(defmethod driver/describe-table-indexes :grist [_driver _database _table] nil)

(defmethod driver/describe-fks :grist
  [driver database & {:keys [table-names]}]
  (let [wanted (some-> table-names set)]
    (for [{:keys [table_id col_id type]} (grist-columns driver database)
          :when (and (str/starts-with? type "Ref:")
                     (or (nil? wanted) (contains? wanted table_id)))]
      {:fk-table-name  table_id, :fk-table-schema nil, :fk-column-name col_id
       :pk-table-name  (subs type 4), :pk-table-schema nil, :pk-column-name "id"})))

(defmethod sql-jdbc.sync/active-tables :grist
  [& args]
  (apply sql-jdbc.sync/post-filtered-active-tables args))

;;; --------------------------------------------- Reading results ------------------------------------------------

;; Grist stores Date and DateTime values as Unix seconds. Its Date columns are declared DATE in SQLite, which
;; sqlite-jdbc would read as *milliseconds* (1970-01-21...). Native SQL queries select these columns directly.
(defn- grist-temporal [^ResultSet rs ^ResultSetMetaData rsmeta ^Integer i parent-thunk]
  (let [obj (.getObject rs i)]
    (if (number? obj)
      (let [instant (Instant/ofEpochMilli (Math/round (* 1000.0 (double obj))))]
        (if (= "DATE" (str/upper-case (str (.getColumnTypeName rsmeta i))))
          (LocalDate/ofInstant instant ZoneOffset/UTC)
          (OffsetDateTime/ofInstant instant ZoneOffset/UTC)))
      (parent-thunk))))

(doseq [jdbc-type [Types/DATE Types/TIMESTAMP]]
  (defmethod sql-jdbc.execute/read-column-thunk [:grist jdbc-type]
    [driver ^ResultSet rs ^ResultSetMetaData rsmeta ^Integer i]
    (let [parent (get-method sql-jdbc.execute/read-column-thunk [:sqlite jdbc-type])
          parent-thunk (parent driver rs rsmeta i)]
      (fn []
        (grist-temporal rs rsmeta i parent-thunk)))))
