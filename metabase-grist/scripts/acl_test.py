#!/usr/bin/env python3
"""Per-user access test: a Grist user who sees part of a document gets exactly that part in Metabase (open source).

Needs a Grist document on which `AGENT` is a viewer restricted by access rules, and Metabase with the grist driver.

    GRIST_URL=http://localhost:38484 GRIST_URL_FOR_METABASE=http://acl-grist:8484 DOC=... \
    OWNER_KEY=... AGENT_KEY=... AGENT_EMAIL=agent.bretagne@example.org \
    METABASE_URL=http://localhost:3000 METABASE_USER=... METABASE_PASSWORD=... python3 acl_test.py
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

E = os.environ
MB, GRIST, DOC = E["METABASE_URL"].rstrip("/"), E["GRIST_URL"].rstrip("/"), E["DOC"]
GRIST_FOR_MB = E.get("GRIST_URL_FOR_METABASE", GRIST)
AGENT_EMAIL, AGENT_PASSWORD = E["AGENT_EMAIL"], "Agent-Demo-2026!"
failures = []


def http(method, url, headers=None, body=None):
    req = urllib.request.Request(url, method=method, headers={"Content-Type": "application/json", **(headers or {})},
                                 data=None if body is None else json.dumps(body).encode())
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            text = resp.read().decode()
            return resp.status, (json.loads(text) if text else None)
    except urllib.error.HTTPError as e:
        text = e.read().decode()
        try:
            return e.code, json.loads(text)
        except ValueError:
            return e.code, text


def session(user, password):
    return {"X-Metabase-Session": http("POST", MB + "/api/session", body={"username": user, "password": password})[1]["id"]}


def check(name, cond, detail=""):
    print(("ok   " if cond else "FAIL ") + name + ("" if cond else f"  -> {detail}"))
    if not cond:
        failures.append(name)


admin = session(E["METABASE_USER"], E["METABASE_PASSWORD"])
mb = lambda m, p, b=None, h=admin: http(m, MB + p, h, b)


def add_db(name, key, records):
    return mb("POST", "/api/database", {"engine": "grist", "name": name, "details": {
        "grist-url": GRIST_FOR_MB, "doc-id": DOC, "api-key": key, "respect-access-rules": records,
        "refresh-seconds": 5}})[1]["id"]


def wait_sync(db):
    for _ in range(60):
        if mb("GET", f"/api/database/{db}")[1]["initial_sync_status"] == "complete":
            return
        time.sleep(2)


def native(db, sql, h=admin):
    status, r = mb("POST", "/api/dataset", {"database": db, "type": "native", "native": {"query": sql}}, h)
    return (r["data"]["rows"] if status in (200, 202) and isinstance(r, dict) and not r.get("error")
            else ("ERROR", status, (r.get("error") if isinstance(r, dict) else r)))


full = add_db("Ventes — complet (propriétaire)", E["OWNER_KEY"], False)
agent_db = add_db("Ventes — vue de l'agent", E["AGENT_KEY"], True)
wait_sync(full)
wait_sync(agent_db)

print("\n# 1. Contenu de l'instantané « vue de l'agent » (règles Grist appliquées)")
check("Commandes : 14 lignes (Bretagne) au lieu de 400",
      native(agent_db, "select count(*) from Commandes") == [[14]] and native(full, "select count(*) from Commandes") == [[400]],
      (native(agent_db, "select count(*) from Commandes"), native(full, "select count(*) from Commandes")))
check("Commandes : uniquement la région Bretagne",
      native(agent_db, "select distinct Region_client from Commandes") == [["Bretagne"]])
check("Clients : 1 ligne au lieu de 30", native(agent_db, "select count(*) from Clients") == [[1]])
cols = mb("GET", f"/api/database/{agent_db}/metadata")[1]
produits = [f["name"] for t in cols["tables"] if t["name"] == "Produits" for f in t["fields"]]
check("Produits : colonne Prix_unitaire absente", "Prix_unitaire" not in produits, produits)
check("SQL natif sur la colonne cachée : erreur", native(agent_db, "select Prix_unitaire from Produits")[0] == "ERROR")
check("Aucune table de règles ni d'historique dans l'instantané",
      native(agent_db, "select count(*) from sqlite_master where name like '_grist_ACL%' or name like '_gristsys%'") == [[0]])

print("\n# 2. Permissions Metabase (édition open source)")
group = mb("POST", "/api/permissions/group", {"name": "Agents Bretagne"})[1]["id"]
status, user = mb("POST", "/api/user", {"first_name": "Agent", "last_name": "Bretagne", "email": AGENT_EMAIL,
                                        "password": AGENT_PASSWORD})
if status != 200:
    user = next(u for u in mb("GET", "/api/user")[1]["data"] if u["email"] == AGENT_EMAIL)
mb("POST", "/api/permissions/membership", {"group_id": group, "user_id": user["id"]})
all_users = next(g["id"] for g in mb("GET", "/api/permissions/group")[1] if g["name"] in ("All Users", "Tous les utilisateurs"))
graph = mb("GET", "/api/permissions/graph")[1]
# Metabase OSS opens every new database to "All Users" and gives a new group access to every database, and a user gets
# the widest right of all their groups: close everything for both groups, then open the agent's database to its group.
for db in mb("GET", "/api/database")[1]["data"]:
    for g in (all_users, group):
        graph["groups"].setdefault(str(g), {})[str(db["id"])] = {"view-data": "unrestricted", "create-queries": "no",
                                                                 "download": {"schemas": "none"}}
graph["groups"][str(group)][str(agent_db)] = {"view-data": "unrestricted", "create-queries": "query-builder",
                                              "download": {"schemas": "full"}}
status, r = mb("PUT", "/api/permissions/graph", graph)
check("droits par base enregistrés (OSS)", status == 200, (status, str(r)[:200]))
graph = mb("GET", "/api/permissions/graph")[1]
graph["groups"][str(all_users)][str(full)]["view-data"] = "blocked"
status, r = mb("PUT", "/api/permissions/graph", graph)
blocked_ok = status == 200
print(f"info « Blocked » (empêche de voir les questions enregistrées) disponible en OSS : {blocked_ok}"
      + ("" if blocked_ok else f" ({status}: {str(r)[:150]})"))

agent = session(AGENT_EMAIL, AGENT_PASSWORD)
visible = sorted(d["name"] for d in mb("GET", "/api/database", None, agent)[1]["data"])
print(f"info bases listées pour l'agent : {visible}")
T = {t["name"]: t["id"] for t in cols["tables"]}
status, r = mb("POST", "/api/dataset", {"database": agent_db, "type": "query",
                                         "query": {"source-table": T["Commandes"], "aggregation": [["count"]]}}, agent)
check("l'agent interroge sa base dans l'éditeur graphique (14)", status in (200, 202) and r["data"]["rows"] == [[14]], (status, str(r)[:200]))
check("l'agent ne peut pas faire de SQL natif (droit non donné)", native(agent_db, "select 1", agent)[0] == "ERROR")
full_md = mb("GET", f"/api/database/{full}/metadata")[1]
full_cmd = next(t["id"] for t in full_md["tables"] if t["name"] == "Commandes")
status, r = mb("POST", "/api/dataset", {"database": full, "type": "query",
                                         "query": {"source-table": full_cmd, "aggregation": [["count"]]}}, agent)
check("l'agent ne peut pas interroger la base complète", status == 403 or (isinstance(r, dict) and r.get("error")), (status, str(r)[:200]))

print("\n# 3. Questions enregistrées par d'autres (fuite via les collections ?)")
card = mb("POST", "/api/card", {"name": "CA complet par région (admin)", "display": "table", "visualization_settings": {},
                                "dataset_query": {"database": full, "type": "native",
                                                  "native": {"query": "select Region_client, sum(Montant_HT) from Commandes group by 1"}}})[1]["id"]
status, r = mb("POST", f"/api/card/{card}/query", {}, agent)
leak_root = status in (200, 202) and isinstance(r, dict) and "data" in r and not r.get("error")
print(f"info question de l'admin dans « Nos analyses », vue par l'agent : {'VISIBLE (fuite)' if leak_root else 'refusée'}"
      f" ({status})")
graph = mb("GET", "/api/collection/graph")[1]
graph["groups"].setdefault(str(all_users), {})["root"] = "none"
mb("PUT", "/api/collection/graph", graph)
status, r = mb("POST", f"/api/card/{card}/query", {}, agent)
check("après retrait de « Nos analyses » au groupe Tous les utilisateurs : refusée",
      not (status in (200, 202) and isinstance(r, dict) and "data" in r and not r.get("error")), (status, str(r)[:150]))
own = mb("POST", "/api/collection", {"name": "Agents Bretagne"})[1]["id"]
graph = mb("GET", "/api/collection/graph")[1]
graph["groups"].setdefault(str(group), {})[str(own)] = "write"
mb("PUT", "/api/collection/graph", graph)
status, r = mb("POST", "/api/card", {"name": "Mes commandes", "display": "table", "visualization_settings": {},
                                      "collection_id": own, "dataset_query": {"database": agent_db, "type": "query",
                                                                              "query": {"source-table": T["Commandes"]}}}, agent)
check("l'agent enregistre ses questions dans la collection de son groupe", status == 200, (status, str(r)[:150]))

print("\n# 4. Révocation dans Grist")
http("PATCH", f"{GRIST}/api/docs/{DOC}/access", {"Authorization": "Bearer " + E["OWNER_KEY"]},
     {"delta": {"users": {AGENT_EMAIL: None}}})
time.sleep(7)
res = native(agent_db, "select count(*) from Commandes")
check("accès retiré dans Grist -> la base de l'agent ne renvoie plus rien (échec fermé)", res[0] == "ERROR", res)
http("PATCH", f"{GRIST}/api/docs/{DOC}/access", {"Authorization": "Bearer " + E["OWNER_KEY"]},
     {"delta": {"users": {AGENT_EMAIL: "viewers"}}})

print("\n" + ("ALL OK" if not failures else f"{len(failures)} FAILED: {failures}"))
sys.exit(1 if failures else 0)
