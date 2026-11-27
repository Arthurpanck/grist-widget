#!/usr/bin/env python3
"""End-to-end check of the Grist driver against a running Grist + Metabase. Run it before upgrading Metabase.

    GRIST_URL=http://localhost:8484 GRIST_API_KEY=... GRIST_URL_FOR_METABASE=http://grist:8484 \
    METABASE_URL=http://localhost:3000 METABASE_USER=... METABASE_PASSWORD=... python3 smoke_test.py

Creates the demo document (seed_demo.py), registers it with a 5 s snapshot freshness, and checks sync, dates,
foreign keys, native SQL, freshness, and that Grist writes are not blocked by a long Metabase query.
"""
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
GRIST_URL = os.environ["GRIST_URL"].rstrip("/")
GRIST_KEY = os.environ["GRIST_API_KEY"]
MB_URL = os.environ["METABASE_URL"].rstrip("/")


def http(method, url, headers, body=None):
    req = urllib.request.Request(url, method=method, headers={**headers, "Content-Type": "application/json"},
                                 data=None if body is None else json.dumps(body).encode())
    with urllib.request.urlopen(req, timeout=120) as resp:
        text = resp.read().decode()
        return json.loads(text) if text else None


session = http("POST", MB_URL + "/api/session", {}, {"username": os.environ["METABASE_USER"],
                                                     "password": os.environ["METABASE_PASSWORD"]})["id"]
mb = lambda m, p, b=None: http(m, MB_URL + p, {"X-Metabase-Session": session}, b)
grist = lambda m, p, b=None: http(m, GRIST_URL + p, {"Authorization": "Bearer " + GRIST_KEY}, b)
failures = []


def check(name, cond, detail=""):
    print(("ok   " if cond else "FAIL ") + name + ("" if cond else f"  -> {detail}"))
    if not cond:
        failures.append(name)


doc = subprocess.check_output([sys.executable, os.path.join(HERE, "seed_demo.py")], text=True).strip()
db = mb("POST", "/api/database", {"engine": "grist", "name": f"smoke {doc}", "details": {
    "grist-url": os.environ.get("GRIST_URL_FOR_METABASE", GRIST_URL), "doc-id": doc, "api-key": GRIST_KEY,
    "refresh-seconds": 5}})["id"]
try:
    for _ in range(60):
        if mb("GET", f"/api/database/{db}")["initial_sync_status"] == "complete":
            break
        time.sleep(2)
    meta = mb("GET", f"/api/database/{db}/metadata")
    tables = {t["name"]: t for t in meta["tables"]}
    F = {(t["name"], f["name"]): f for t in meta["tables"] for f in t["fields"]}
    check("internal tables hidden", not any(n.startswith("_grist") for n in tables), sorted(tables))
    check("Ref column is a foreign key", F[("Commandes", "Client")]["fk_target_field_id"] == F[("Clients", "id")]["id"])
    check("Date column coerced", F[("Commandes", "Date_commande")]["effective_type"] == "type/Instant")
    check("helper columns hidden", ("Commandes", "manualSort") not in F)

    def run(query):
        r = mb("POST", "/api/dataset", {"database": db, **query})
        if r.get("error"):
            raise AssertionError(r["error"])
        return r["data"]["rows"]

    T = lambda n: tables[n]["id"]
    years = run({"type": "query", "query": {"source-table": T("Commandes"), "aggregation": [["count"]],
                 "breakout": [["field", F[("Commandes", "Date_commande")]["id"], {"temporal-unit": "year"}]]}})
    check("group by year", [str(y)[:4] for y, _ in years] == ["2025", "2026"], years)
    seg = run({"type": "query", "query": {"source-table": T("Commandes"),
               "aggregation": [["sum", ["field", F[("Commandes", "Montant_HT")]["id"], None]]],
               "breakout": [["field", F[("Clients", "Segment")]["id"],
                             {"source-field": F[("Commandes", "Client")]["id"]}]]}})
    check("implicit join through the reference", len(seg) == 4, seg)
    native = run({"type": "native", "native": {"query": "select Date_commande from Commandes where id = 1"}})
    check("native SQL reads Grist dates", str(native[0][0]).startswith(("2025", "2026")), native)

    grist("PATCH", f"/api/docs/{doc}/tables/Clients/records", {"records": [{"id": 1, "fields": {"Nom": "changed"}}]})
    time.sleep(6)
    nom = run({"type": "native", "native": {"query": "select Nom from Clients where id = 1"}})[0][0]
    check("snapshot refreshed after refresh-seconds", nom == "changed", nom)

    long_query = threading.Thread(target=run, args=({"type": "native", "native": {"query":
        "with recursive r(x) as (select 1 union all select x + 1 from r where x < 20000000) select count(*) from r"}},))
    long_query.start()
    time.sleep(1)
    try:
        grist("PATCH", f"/api/docs/{doc}/tables/Clients/records", {"records": [{"id": 1, "fields": {"Nom": "again"}}]})
        check("Grist writes while Metabase runs a long query", True)
    except Exception as e:  # noqa: BLE001
        check("Grist writes while Metabase runs a long query", False, e)
    long_query.join()
finally:
    mb("DELETE", f"/api/database/{db}")
    grist("DELETE", f"/api/docs/{doc}")

print("\n" + ("ALL OK" if not failures else f"{len(failures)} FAILED: {failures}"))
sys.exit(1 if failures else 0)
