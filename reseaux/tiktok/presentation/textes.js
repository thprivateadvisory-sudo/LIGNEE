// Rend chaque texte de scenes.json en PNG transparent 1080 x 1920.
// Usage : node textes.js <dossier_sortie> [scenes.json]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ici = __dirname;
const racine = path.resolve(ici, '../../..');
const sortie = path.resolve(process.argv[2] || path.join(ici, 'build'));
fs.mkdirSync(sortie, { recursive: true });
const { scenes } = JSON.parse(fs.readFileSync(path.resolve(process.argv[3] || path.join(ici, 'scenes.json')), 'utf8'));
const police = (f) => 'file://' + path.join(racine, 'polices', f);
const logo = 'file://' + path.join(racine, 'images', 'logo-lignee.png');

const css = `
@font-face{font-family:Cormorant;src:url(${police('cormorant-garamond.woff2')})}
@font-face{font-family:Cormorant;font-style:italic;src:url(${police('cormorant-garamond-italique.woff2')})}
@font-face{font-family:Inter;src:url(${police('inter.woff2')})}
html,body{margin:0;width:1080px;height:1920px;background:transparent;overflow:hidden}
.t{position:absolute;left:70px;right:70px;text-align:center;color:#FBF9F4;
   text-shadow:0 2px 22px rgba(10,16,28,.7),0 1px 4px rgba(10,16,28,.6)}
.grand-haut{top:680px;font:600 90px/1.1 Cormorant}
em{font-style:italic;color:#E2C68E}
.accroche,.grand,.grand-haut,.liste,.trio,.petit-bas{padding:50px 0;background:radial-gradient(ellipse 60% 55% at 50% 50%,rgba(10,16,28,.42),rgba(10,16,28,0) 100%)}
.accroche{top:560px;font:600 106px/1.04 Cormorant;letter-spacing:-.5px}
.grand{top:860px;font:600 90px/1.1 Cormorant}
.grand-bas{top:1100px;font:italic 600 90px/1.1 Cormorant;color:#E2C68E}
.petit-bas{top:1130px;font:500 46px/1.3 Inter;letter-spacing:.2px}
.etiquette{top:1210px;left:170px;right:170px;font:500 34px/1.35 Inter;letter-spacing:.3px;
   background:rgba(245,241,232,.92);color:#1B2A41;text-shadow:none;border-radius:16px;padding:22px 26px}
.liste{top:780px;display:flex;flex-direction:column;gap:26px;align-items:center}
.liste span{font:600 62px/1.1 Cormorant}
.liste span::before{content:'';display:block;width:56px;height:2px;background:#D9B97F;margin:0 auto 22px}
.trio{top:1110px;font:500 38px/1 Inter;letter-spacing:3px;text-transform:uppercase;color:#E2C68E;
   display:flex;justify-content:center;gap:18px}
.trio i{font-style:normal;color:#FBF9F4}
.fin{inset:0;left:0;right:0;background:#F5F1E8;color:#1B2A41;text-shadow:none;display:flex;flex-direction:column;
   align-items:center;justify-content:center;gap:0;padding-bottom:180px}
.fin img{width:560px;margin-bottom:56px}
.fin .dev{font:italic 600 76px/1.15 Cormorant;color:#1B2A41;margin-bottom:26px}
.fin .site{font:600 50px/1 Inter;letter-spacing:1px;color:#1B2A41}
.fin .pseudo{font:500 34px/1 Inter;color:#7D6431;margin-top:18px}
.fin hr{width:80px;border:0;border-top:2px solid #B89B5E;margin:56px 0 40px}
.chiffre{top:560px;font:600 64px/1.15 Cormorant}
.chiffre big{display:block;font:600 250px/1 Cormorant;color:#E2C68E;margin:14px 0 6px;letter-spacing:-4px}
.pilier{top:860px;font:600 84px/1.1 Cormorant;padding:50px 0;background:radial-gradient(ellipse 60% 55% at 50% 50%,rgba(10,16,28,.42),rgba(10,16,28,0) 100%)}
.pilier b{display:block;font:600 34px/1 Inter;letter-spacing:7px;text-transform:uppercase;color:#E2C68E;margin-bottom:30px}
.chiffre{padding:50px 0;background:radial-gradient(ellipse 60% 55% at 50% 50%,rgba(10,16,28,.42),rgba(10,16,28,0) 100%)}
.fin .partage{font:500 40px/1.4 Inter;color:#5B6472;max-width:820px}
`;

const fin = `<img src="${logo}"><div class="dev">Le funéraire, enfin humain.</div>
<div class="site">maison-lignee.fr</div><div class="pseudo">@maison.lignee</div><hr>
<div class="partage">Envoyez cette vidéo à quelqu'un<br>qui n'ose pas ouvrir l'armoire.</div>`;

(async () => {
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [i, s] of scenes.entries()) {
    for (const [j, t] of s.textes.entries()) {
      const html = t.style === 'fin' ? (t.html ? `<img src="${logo}">` + t.html : fin) : t.html;
      const f = path.join(sortie, '_texte.html');
      fs.writeFileSync(f, `<!doctype html><meta charset="utf-8"><style>${css}</style><div class="t ${t.style}">${html}</div>`);
      await page.goto('file://' + f);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(sortie, `t${i}_${j}.png`), omitBackground: true });
    }
  }
  await nav.close();
  console.log('textes rendus dans', sortie);
})();
