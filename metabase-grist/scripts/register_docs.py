#!/usr/bin/env python3
"""Register every Grist document a service account can read as a Metabase database (engine "grist").

Idempotent: run it from a CronJob to pick up new documents. For each document it
  * creates the Metabase database if none has this doc-id yet (or updates its name),
  * closes the new database to every group but Administrators and METABASE_GROUP (Metabase opens a new database to
    "All Users", native SQL included),
  * once synced, sets Metabase display names from the Grist column labels.

Environment:
  GRIST_URL          Grist as seen from this script, e.g. http://grist:8484
  GRIST_API_KEY      API key of a Grist service account (GRIST_ENABLE_SERVICE_ACCOUNTS=true on Grist), shared as
                     viewer on the documents to publish: only those are registered
  GRIST_URL_FOR_METABASE  Grist as seen from Metabase (default: GRIST_URL)
  METABASE_URL       e.g. http://metabase:3000
  METABASE_API_KEY   a Metabase API key (Admin > Authentication > API keys), or
  METABASE_USER / METABASE_PASSWORD
  REFRESH_SECONDS    snapshot freshness passed to the driver (default 300)
  GRIST_WORKSPACES   optional comma-separated workspace names to limit the scan
  RESPECT_ACCESS_RULES  "true": snapshots hold only what the key's account sees in Grist (records API)
  METABASE_GROUP     optional Metabase group given query-builder access to the new databases (no native SQL)
  AUDIENCE           optional audience name ("Bretagne"), appended to database names: run the script once per
                     audience (one service account, one Metabase group each) to give each its own databases
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

GRIST_URL = os.environ["GRIST_URL"].rstrip("/")
GRIST_KEY = os.environ["GRIST_API_KEY"]
GRIST_URL_FOR_METABASE = os.environ.get("GRIST_URL_FOR_METABASE", GRIST_URL).rstrip("/")
MB_URL = os.environ["METABASE_URL"].rstrip("/")
REFRESH = int(os.environ.get("REFRESH_SECONDS", "300"))
ONLY_WS = {w.strip() for w in os.environ.get("GRIST_WORKSPACES", "").split(",") if w.strip()}
RESPECT_RULES = os.environ.get("RESPECT_ACCESS_RULES", "").lower() in ("1", "true", "yes")
MB_GROUP = os.environ.get("METABASE_GROUP", "").strip()
AUDIENCE = os.environ.get("AUDIENCE", "").strip()
SUFFIX = f" — {AUDIENCE}" if AUDIENCE else ""


def http(method, url, headers, body=None):
    req = urllib.request.Request(url, method=method, headers={**headers, "Content-Type": "application/json"},
                                 data=None if body is None else json.dumps(body).encode())
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            text = resp.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {url} -> {e.code}: {e.read().decode()[:400]}")


def grist(path):
    return http("GET", GRIST_URL + path, {"Authorization": "Bearer " + GRIST_KEY})


def metabase_headers():
    if os.environ.get("METABASE_API_KEY"):
        return {"x-api-key": os.environ["METABASE_API_KEY"]}
    session = http("POST", MB_URL + "/api/session", {}, {
        "username": os.environ["METABASE_USER"], "password": os.environ["METABASE_PASSWORD"]})
    return {"X-Metabase-Session": session["id"]}


MB_HEADERS = metabase_headers()


def mb(method, path, body=None):
    return http(method, MB_URL + path, MB_HEADERS, body)


def grist_docs():
    for org in grist("/api/orgs"):
        for ws in grist(f"/api/orgs/{org['id']}/workspaces"):
            if ONLY_WS and ws["name"] not in ONLY_WS:
                continue
            for doc in ws.get("docs", []):
                if doc.get("removedAt"):  # in the trash
                    continue
                yield org, ws, doc


def wait_for_sync(db_id, timeout=300):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if mb("GET", f"/api/database/{db_id}").get("initial_sync_status") == "complete":
            return True
        time.sleep(3)
    return False


def apply_labels(db_id, doc_id):
    """Use Grist column labels ("Date de commande") as Metabase display names."""
    meta = mb("GET", f"/api/database/{db_id}/metadata?include_hidden=true")
    for table in meta["tables"]:
        try:
            cols = grist(f"/api/docs/{doc_id}/tables/{urllib.parse.quote(table['name'])}/columns")["columns"]
        except SystemExit:
            continue
        labels = {c["id"]: c["fields"].get("label") for c in cols}
        for field in table["fields"]:
            label = labels.get(field["name"])
            if label and label != field["display_name"]:
                mb("PUT", f"/api/field/{field['id']}", {"display_name": label})


def close_database(db_id):
    """No access to `db_id` for any group but Administrators, query-builder access for METABASE_GROUP."""
    groups = mb("GET", "/api/permissions/group")
    graph = mb("GET", "/api/permissions/graph")
    target = None
    for g in groups:
        if g["name"] in ("Administrators", "Administrateurs"):
            continue
        graph["groups"].setdefault(str(g["id"]), {})[str(db_id)] = {
            "view-data": "unrestricted", "create-queries": "no", "download": {"schemas": "none"}}
        if g["name"] == MB_GROUP:
            target = g["id"]
    if MB_GROUP and target is None:
        print(f"  Metabase group {MB_GROUP!r} not found: database left closed to everyone", file=sys.stderr)
    if target is not None:
        graph["groups"][str(target)][str(db_id)] = {
            "view-data": "unrestricted", "create-queries": "query-builder", "download": {"schemas": "full"}}
    mb("PUT", "/api/permissions/graph", graph)


def main():
    existing = {}
    for db in mb("GET", "/api/database")["data"]:
        if (db["engine"] == "grist" and db.get("details", {}).get("doc-id")
                and (db["name"].endswith(SUFFIX) if SUFFIX else " — " not in db["name"])):
            existing[db["details"]["doc-id"]] = db

    for org, ws, doc in grist_docs():
        name = f"{ws['name']} / {doc['name']}{SUFFIX}"
        db = existing.get(doc["id"])
        if db is None:
            print(f"+ {name} ({doc['id']})")
            db = mb("POST", "/api/database", {
                "engine": "grist", "name": name,
                "details": {"grist-url": GRIST_URL_FOR_METABASE, "doc-id": doc["id"], "api-key": GRIST_KEY,
                            "respect-access-rules": RESPECT_RULES, "refresh-seconds": REFRESH},
            })
            close_database(db["id"])
        elif db["name"] != name:
            print(f"~ {db['name']} -> {name}")
            mb("PUT", f"/api/database/{db['id']}", {"name": name})
        else:
            print(f"= {name}")
        if wait_for_sync(db["id"]):
            apply_labels(db["id"], doc["id"])
        else:
            print(f"  sync not finished yet for {name}; labels will be applied on the next run", file=sys.stderr)


if __name__ == "__main__":
    main()
