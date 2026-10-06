"""Génère le catalogue imprimable : python3 catalogue/generer.py

Sortie : catalogue/Lignee-catalogue-2026.pdf
Format fini A4 (210 x 297 mm), fonds perdus de 3 mm sur chaque bord (216 x 303 mm).
Nécessite Playwright et Chromium.
"""
import os, pathlib
from playwright.sync_api import sync_playwright

ICI = pathlib.Path(__file__).resolve().parent
SORTIE = ICI / "Lignee-catalogue-2026.pdf"

with sync_playwright() as p:
    nav = p.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None)
    page = nav.new_page()
    page.goto((ICI / "catalogue.html").as_uri(), wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    page.pdf(path=str(SORTIE), width="216mm", height="303mm", print_background=True, prefer_css_page_size=True)
    nav.close()
print(SORTIE)
