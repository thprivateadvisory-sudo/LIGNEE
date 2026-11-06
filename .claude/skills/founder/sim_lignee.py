#!/usr/bin/env python3
"""Simulateur Lignée : 12 mois de ventes souvenirs + mises en relation assurance obsèques.

Usage :
  python3 .claude/skills/founder/sim_lignee.py
  python3 .claude/skills/founder/sim_lignee.py --budget-pub 600 --panier 110 --montecarlo 5000
  python3 .claude/skills/founder/sim_lignee.py --json

Lignes de revenu modélisées :
  1. Souvenirs (doudous, coussins, cadres, plaques) : vente directe, paiement en ligne.
  2. Assurance obsèques : Lignée N'EST PAS intermédiaire (pas d'ORIAS). Elle ne peut être
     payée qu'au forfait par mise en relation qualifiée, sans lien avec la signature, et sans
     présenter ni conseiller de contrat. Une commission par contrat suppose une inscription
     ORIAS (mandataire d'intermédiaire, par exemple) : option --orias pour simuler ce cas.
  3. Cercueils : désactivés tant qu'il n'y a pas d'habilitation préfectorale (--habilitation).

Valeurs par défaut = HYPOTHÈSES de départ, à remplacer par les vrais chiffres
(devis de l'artisan, coût de la pub, taux observés).
"""
import argparse
import json
import random

DEFAUTS = {
    # Acquisition
    "budget_pub": 300.0,        # €/mois (Meta + Google)
    "cpc": 0.60,                # € par clic
    "visites_organiques": 150,  # visites/mois au mois 1 (réseau, SEO, partenaires)
    "croissance_orga_pct": 0.15,  # croissance mensuelle des visites organiques
    "conv_souvenir_pct": 0.012, # visites -> commande souvenir
    "conv_lead_assur_pct": 0.006,  # visites -> demande d'étude obsèques
    "leads_partenaires": 2,     # demandes/mois via pompes funèbres, EHPAD, notaires
    # Souvenirs
    "panier": 95.0,             # € TTC moyen
    "tva_pct": 0.20,
    "cout_fabrication_pct": 0.40,  # part du prix HT payée à l'artisan + matières
    "frais_envoi": 7.0,         # € par commande, à la charge de Lignée
    "frais_paiement_pct": 0.015,
    "frais_paiement_fixe": 0.25,
    "retours_pct": 0.03,
    # Assurance obsèques
    "forfait_lead": 30.0,       # € HT par mise en relation qualifiée (sans ORIAS)
    "taux_signature_pct": 0.25, # leads -> contrats (pour le cas ORIAS)
    "prime_annuelle": 420.0,    # € de cotisation moyenne
    "commission_pct": 0.30,     # commission 1re année sur la prime (cas ORIAS)
    # Cercueils (habilitation)
    "ventes_cercueils": 3,      # par mois si habilité
    "marge_cercueil": 250.0,    # € de marge par cercueil après transport
    # Structure
    "fixes": 120.0,             # €/mois : domaine, outils, assurance RC pro, banque
    "mois": 12,
}


def simuler(p, orias=False, habilitation=False, rnd=None):
    def bruit(x, sd):
        return x if rnd is None else max(0.05 * x, rnd.gauss(x, sd * x))
    lignes, cumul = [], 0.0
    for m in range(1, p["mois"] + 1):
        orga = p["visites_organiques"] * (1 + p["croissance_orga_pct"]) ** (m - 1)
        payees = p["budget_pub"] / bruit(p["cpc"], 0.3) if p["cpc"] > 0 else 0.0
        visites = orga + payees
        cmd = visites * bruit(p["conv_souvenir_pct"], 0.4)
        leads = visites * bruit(p["conv_lead_assur_pct"], 0.4) + p["leads_partenaires"]

        ca_ttc = cmd * p["panier"] * (1 - p["retours_pct"])
        ca_ht = ca_ttc / (1 + p["tva_pct"])
        cout_var = (ca_ht * p["cout_fabrication_pct"] + cmd * p["frais_envoi"]
                    + ca_ttc * p["frais_paiement_pct"] + cmd * p["frais_paiement_fixe"])
        marge_souvenirs = ca_ht - cout_var

        if orias:
            rev_assur = leads * p["taux_signature_pct"] * p["prime_annuelle"] * p["commission_pct"]
        else:
            rev_assur = leads * p["forfait_lead"]
        rev_cercueils = p["ventes_cercueils"] * p["marge_cercueil"] if habilitation else 0.0

        resultat = marge_souvenirs + rev_assur + rev_cercueils - p["fixes"] - p["budget_pub"]
        cumul += resultat
        lignes.append({
            "mois": m, "visites": round(visites), "commandes": round(cmd, 1),
            "leads_obseques": round(leads, 1), "ca_souvenirs_ttc": round(ca_ttc),
            "marge_souvenirs": round(marge_souvenirs), "revenu_assurance": round(rev_assur),
            "revenu_cercueils": round(rev_cercueils), "resultat": round(resultat),
            "cumul": round(cumul),
        })
    marge_unit = (p["panier"] / (1 + p["tva_pct"]) * (1 - p["cout_fabrication_pct"])
                  - p["frais_envoi"] - p["panier"] * p["frais_paiement_pct"] - p["frais_paiement_fixe"])
    cac_max = marge_unit  # coût d'acquisition max pour ne pas perdre d'argent à la 1re commande
    cac_reel = p["cpc"] / p["conv_souvenir_pct"]
    return lignes, {"marge_par_commande": round(marge_unit, 2),
                    "cout_acquisition_pub_par_commande": round(cac_reel, 2),
                    "pub_rentable": cac_reel <= cac_max}


def montecarlo(p, n, orias, habilitation, seed=7):
    rnd = random.Random(seed)
    cumuls, m12 = [], []
    for _ in range(n):
        l, _ = simuler(p, orias, habilitation, rnd)
        cumuls.append(l[-1]["cumul"]); m12.append(l[-1]["resultat"])
    cumuls.sort(); m12.sort()
    q = lambda xs, k: xs[int(k * (len(xs) - 1))]
    return {"tirages": n, "cumul_12m_p10": q(cumuls, .1), "cumul_12m_median": q(cumuls, .5),
            "cumul_12m_p90": q(cumuls, .9), "resultat_mois12_median": q(m12, .5),
            "proba_perte_sur_12m_pct": round(100 * sum(c < 0 for c in cumuls) / n, 1)}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for k, v in DEFAUTS.items():
        ap.add_argument("--" + k.replace("_", "-"), type=type(v), default=v)
    ap.add_argument("--orias", action="store_true", help="simuler une commission par contrat (suppose l'inscription ORIAS)")
    ap.add_argument("--habilitation", action="store_true", help="simuler la vente de cercueils (suppose l'habilitation)")
    ap.add_argument("--montecarlo", type=int, default=0)
    ap.add_argument("--json", action="store_true")
    a = vars(ap.parse_args())
    p = {k: a[k] for k in DEFAUTS}
    lignes, unit = simuler(p, a["orias"], a["habilitation"])
    out = {"hypotheses": p, "unitaire": unit, "mois": lignes}
    if a["montecarlo"]:
        out["montecarlo"] = montecarlo(p, a["montecarlo"], a["orias"], a["habilitation"])
    if a["json"]:
        print(json.dumps(out, ensure_ascii=False, indent=2)); return
    print("== Unitaire souvenirs")
    for k, v in unit.items():
        print(f"  {k:<36} {v}")
    print("\n mois  visites  cmd  leads  CA TTC  marge  assur  résultat   cumul")
    for l in lignes:
        print(f"  {l['mois']:>3} {l['visites']:>8} {l['commandes']:>5} {l['leads_obseques']:>5} "
              f"{l['ca_souvenirs_ttc']:>7} {l['marge_souvenirs']:>6} {l['revenu_assurance']:>6} "
              f"{l['resultat']:>9} {l['cumul']:>7}")
    if "montecarlo" in out:
        print("\n== Monte Carlo")
        for k, v in out["montecarlo"].items():
            print(f"  {k:<28} {v}")


if __name__ == "__main__":
    main()
