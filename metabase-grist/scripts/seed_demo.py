#!/usr/bin/env python3
"""Create a demo Grist document that uses most Grist column types.

    GRIST_URL=http://localhost:8484 GRIST_API_KEY=... python3 seed_demo.py

Prints the new document id.
"""
import json
import os
import random
import urllib.request
from datetime import date, datetime, timedelta, timezone

GRIST_URL = os.environ.get("GRIST_URL", "http://localhost:8484").rstrip("/")
API_KEY = os.environ["GRIST_API_KEY"]
WORKSPACE = os.environ.get("GRIST_WORKSPACE_ID")


def api(method, path, body=None):
    req = urllib.request.Request(
        GRIST_URL + path,
        method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"Authorization": "Bearer " + API_KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        text = resp.read().decode()
        return json.loads(text) if text else None


def col(cid, label, type_, **extra):
    fields = {"label": label, "type": type_}
    fields.update(extra)
    return {"id": cid, "fields": fields}


ws = WORKSPACE or api("GET", "/api/orgs/current/workspaces")[0]["id"]
doc = api("POST", f"/api/workspaces/{ws}/docs", {"name": "Ventes démo"})
base = f"/api/docs/{doc}"

api("POST", base + "/tables", {"tables": [
    {"id": "Clients", "columns": [
        col("Nom", "Nom", "Text"),
        col("Segment", "Segment", "Choice",
            widgetOptions=json.dumps({"choices": ["PME", "ETI", "Grand compte", "Public"]})),
        col("Region", "Région", "Text"),
        col("Actif", "Actif", "Bool"),
        col("Client_depuis", "Client depuis", "Date"),
    ]},
    {"id": "Produits", "columns": [
        col("Libelle", "Libellé", "Text"),
        col("Prix_unitaire", "Prix unitaire", "Numeric"),
        col("Tags", "Tags", "ChoiceList",
            widgetOptions=json.dumps({"choices": ["Logiciel", "Service", "Matériel", "Abonnement"]})),
    ]},
    {"id": "Commandes", "columns": [
        col("Client", "Client", "Ref:Clients"),
        col("Produit", "Produit", "Ref:Produits"),
        col("Quantite", "Quantité", "Int"),
        col("Date_commande", "Date de commande", "Date"),
        col("Livree_le", "Livrée le", "DateTime:Europe/Paris"),
        col("Statut", "Statut", "Choice",
            widgetOptions=json.dumps({"choices": ["Brouillon", "Validée", "Livrée", "Annulée"]})),
        col("Montant_HT", "Montant HT", "Numeric", isFormula=True,
            formula="$Quantite * $Produit.Prix_unitaire"),
        col("Region_client", "Région client", "Any", isFormula=True, formula="$Client.Region"),
    ]},
]})

random.seed(42)
regions = ["Île-de-France", "Auvergne-Rhône-Alpes", "Occitanie", "Bretagne", "Hauts-de-France"]
segments = ["PME", "ETI", "Grand compte", "Public"]
epoch = lambda d: int(datetime(d.year, d.month, d.day, tzinfo=timezone.utc).timestamp())

clients = [{"fields": {
    "Nom": f"Client {i:02d}", "Segment": random.choice(segments),
    "Region": random.choice(regions), "Actif": random.random() > 0.2,
    "Client_depuis": epoch(date(2020, 1, 1) + timedelta(days=random.randint(0, 1500))),
}} for i in range(1, 31)]
api("POST", base + "/tables/Clients/records", {"records": clients})

produits = [
    ("Licence Pro", 1200.0, ["Logiciel", "Abonnement"]),
    ("Formation", 800.0, ["Service"]),
    ("Serveur", 4500.0, ["Matériel"]),
    ("Support annuel", 2000.0, ["Service", "Abonnement"]),
    ("Audit", 3500.0, ["Service"]),
]
api("POST", base + "/tables/Produits/records", {"records": [
    {"fields": {"Libelle": l, "Prix_unitaire": p, "Tags": ["L"] + t}} for l, p, t in produits]})

commandes = []
for _ in range(400):
    d = date(2025, 1, 1) + timedelta(days=random.randint(0, 690))
    statut = random.choices(["Brouillon", "Validée", "Livrée", "Annulée"], [1, 3, 6, 1])[0]
    livree = None
    if statut == "Livrée":
        livree = epoch(d) + random.randint(2, 20) * 86400 + random.randint(8, 18) * 3600
    commandes.append({"fields": {
        "Client": random.randint(1, 30), "Produit": random.randint(1, 5),
        "Quantite": random.randint(1, 12), "Date_commande": epoch(d),
        "Livree_le": livree, "Statut": statut,
    }})
api("POST", base + "/tables/Commandes/records", {"records": commandes})
print(doc)
