// Cercueils Lignée en 3D : formes, teintes, poignées, emblème, plaque gravée et couvercle ouvrant.
// Représentation indicative construite à partir des photos du catalogue.
import * as THREE from './three.module.min.js';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';

const L = 1.95;               // longueur hors tout (m)
const XS = L / 2 - 0.47;      // épaules
const HF = 0.21, HS = 0.31, HH = 0.24; // demi-largeurs : pieds, épaules, tête
const EP = 0.022;             // épaisseur réglementaire du bois
const Y_SOCLE = 0.04, H_CAISSE = 0.30;
const Y_HAUT = Y_SOCLE + H_CAISSE;

// Profils : décalage latéral de la caisse selon la hauteur (t de 0 à 1).
const PROFILS = {
  droit: () => 0,
  galbe: t => (t < 0.58 ? 0.038 * Math.sin(Math.PI * t / 0.58) : 0),
};

// Couvercles : couches successives [hauteur, retrait].
// Formes de chaque modèle, relevées sur les photos du catalogue.
// socle : couches [hauteur, débord] ; rainures et bandeaux : hauteur relative sur la caisse.
const FORMES = {
  sobre: { profil: 'droit', couvercle: 'pans', finition: 'satine', socle: [[0.04, 0.016]], rainures: [0.82], vis: true, poignees: { x: [-0.5, 0.25], t: 0.58 } },
  tradition: { profil: 'galbe', couvercle: 'moulure', finition: 'satine', socle: [[0.035, 0.02]], rainures: [0.62], vis: true, poignees: { x: [-0.62, -0.12, 0.38], t: 0.8 } },
  floral: { profil: 'droit', couvercle: 'arrondi', finition: 'brillant', socle: [[0.022, 0.024], [0.008, 0.014], [0.02, 0.022]], bandeaux: [[0.93, 0.012, 0.022]], gravure: true, poignees: { x: [-0.84, 0.45], t: 0.62 } },
  heritage: { profil: 'droit', couvercle: 'gradins', finition: 'brillant', socle: [[0.03, 0.028], [0.035, 0.014]], bandeaux: [[0.7, 0.008, 0.02]], rainures: [0.4], poignees: { x: [-0.62, -0.12, 0.38], t: 0.8 } },
};

const COUVERCLES = {
  pans: [[0.04, 0.014, 0.014], [0.016, -0.008, -0.008], [0.07, -0.028, -0.085], [0.014, -0.085, -0.085]],
  moulure: [[0.04, 0.016, 0.016], [0.018, -0.004, -0.012], [0.022, -0.022, -0.022], [0.065, -0.034, -0.09], [0.014, -0.09, -0.09]],
  arrondi: [[0.014, 0.004, 0.016], [0.014, 0.016, 0.021], [0.014, 0.021, 0.016], [0.014, 0.016, 0.002], [0.014, 0.002, -0.016], [0.05, -0.02, -0.04], [0.014, -0.04, -0.04]],
  gradins: [[0.04, 0.016, 0.016], [0.016, -0.004, -0.004], [0.13, -0.018, -0.165], [0.018, -0.165, -0.165]],
};

function contour(d) {
  const s = new THREE.Shape();
  const p = [[-L / 2 - d, HF + d], [XS, HS + d], [L / 2 + d, HH + d], [L / 2 + d, -HH - d], [XS, -HS - d], [-L / 2 - d, -HF - d]];
  s.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) s.lineTo(p[i][0], p[i][1]);
  s.closePath();
  return s;
}

function points(d) {
  return [[-L / 2 - d, HF + d], [XS, HS + d], [L / 2 + d, HH + d], [L / 2 + d, -HH - d], [XS, -HS - d], [-L / 2 - d, -HF - d]];
}

function tronc(d0, d1, y, h, dessous = false, dessus = true) {
  const a = points(d0), b = points(d1), v = [];
  const P = (q, yy) => [q[0], yy, -q[1]];
  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6, p0 = P(a[i], y), p1 = P(a[j], y), p2 = P(b[j], y + h), p3 = P(b[i], y + h);
    v.push(...p0, ...p2, ...p1, ...p0, ...p3, ...p2);
  }
  for (let i = 1; i < 5; i++) {
    if (dessus) v.push(...P(b[0], y + h), ...P(b[i + 1], y + h), ...P(b[i], y + h));
    if (dessous) v.push(...P(a[0], y), ...P(a[i], y), ...P(a[i + 1], y));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(v.length / 3 * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}

// Trou : contour parcouru en sens inverse, pour que les parois intérieures soient tournées vers l'intérieur
function trou(d) {
  return new THREE.Path(contour(d).getPoints().reverse());
}

function extrude(forme, h, y, biseau = 0.003) {
  const g = new THREE.ExtrudeGeometry(forme, { depth: h, bevelEnabled: biseau > 0, bevelThickness: biseau, bevelSize: biseau, bevelSegments: 2, curveSegments: 6 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  return g;
}

// UV planaires en mètres : le fil du bois court dans la longueur.
function uvBois(g) {
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (Math.abs(nor.getX(i)) > 0.7) uv.setXY(i, z * 0.9, y * 0.9);
    else uv.setXY(i, x * 0.5, (y + z) * 0.9);
  }
  uv.needsUpdate = true;
  return g;
}

function bruit(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function textureBois(hex) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 512;
  const x = c.getContext('2d'), r = bruit(7), base = new THREE.Color(hex);
  x.fillStyle = '#' + base.getHexString(); x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 120; i++) {
    const y0 = r() * c.height, sombre = r() < 0.65, a = 0.025 + r() * 0.07;
    const col = base.clone().multiplyScalar(sombre ? 0.62 + r() * 0.2 : 1.12 + r() * 0.1);
    x.strokeStyle = `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},${a})`;
    x.lineWidth = 0.6 + r() * 3.2;
    x.beginPath();
    const amp = 2 + r() * 9, f = 0.002 + r() * 0.006, ph = r() * 6;
    for (let px = 0; px <= c.width; px += 16) {
      const py = y0 + Math.sin(px * f + ph) * amp + Math.sin(px * f * 3.1 + ph) * amp * 0.25;
      px ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
  }
  for (let i = 0; i < 6; i++) { // ondes de dosse
    const cx = r() * c.width, cy = r() * c.height, w = 180 + r() * 300;
    for (let k = 0; k < 7; k++) {
      x.strokeStyle = `rgba(0,0,0,${0.02 + r() * 0.02})`; x.lineWidth = 1.2;
      x.beginPath(); x.ellipse(cx, cy, w - k * 22, 18 + k * 7, 0, 0, Math.PI * 2); x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function textureSatin(hex, plis) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const x = c.getContext('2d'), base = new THREE.Color(hex);
  for (let i = 0; i < 512; i++) {
    const v = plis ? 0.86 + 0.14 * Math.pow(Math.abs(Math.sin(i / 512 * Math.PI * 14)), 0.6) : 1;
    const col = base.clone().multiplyScalar(v);
    x.fillStyle = '#' + col.getHexString(); x.fillRect(plis ? i : 0, plis ? 0 : i, plis ? 1 : 512, plis ? 512 : 1);
  }
  if (!plis) { // capitonnage en losanges
    x.strokeStyle = 'rgba(0,0,0,.07)'; x.lineWidth = 3;
    for (let k = -512; k < 1024; k += 64) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 512, 512); x.stroke(); x.beginPath(); x.moveTo(k, 512); x.lineTo(k + 512, 0); x.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(3, 3);
  return t;
}

const METAUX = {
  laiton: { color: 0xD2AE62, roughness: 0.26 },
  'laiton-vieilli': { color: 0xA7834C, roughness: 0.42 },
  'bronze-vieilli': { color: 0x7C5C38, roughness: 0.5 },
  bronze: { color: 0x8A6A40, roughness: 0.46 },
  dore: { color: 0xE0B85A, roughness: 0.22 },
};
const metal = n => new THREE.MeshStandardMaterial({ metalness: 1, ...METAUX[n] });

// Poignées : construites dans le plan local XY, saillie vers +Z.
const POIGNEES = {
  'demi-lune': m => {
    const g = new THREE.Group();
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.008, 14, 40, Math.PI), m); arc.rotation.z = Math.PI; arc.position.z = 0.032; g.add(arc);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.032, 12), m); p.rotation.x = Math.PI / 2; p.position.set(s * 0.06, 0, 0.016); g.add(p); }
    return g;
  },
  barre: m => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.27, 16), m); b.rotation.z = Math.PI / 2; b.position.z = 0.042; g.add(b);
    for (const s of [-1, 1]) {
      const pl = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.012), m); pl.position.set(s * 0.09, 0, 0.006); g.add(pl);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.032, 10), m); p.rotation.x = Math.PI / 2; p.position.set(s * 0.09, 0, 0.028); g.add(p);
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.013, 14, 10), m); e.position.set(s * 0.135, 0, 0.042); g.add(e);
    }
    return g;
  },
  etrier: m => {
    const g = new THREE.Group();
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.075, 0, 0.014), new THREE.Vector3(-0.072, -0.04, 0.03), new THREE.Vector3(-0.04, -0.058, 0.036), new THREE.Vector3(0.04, -0.058, 0.036), new THREE.Vector3(0.072, -0.04, 0.03), new THREE.Vector3(0.075, 0, 0.014)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 48, 0.007, 12), m));
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.026, 0.024), m); b.position.set(s * 0.075, 0.004, 0.012); g.add(b); }
    return g;
  },
  rosaces: m => {
    const g = new THREE.Group();
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.006, 12, 36, Math.PI), m); arc.rotation.z = Math.PI; arc.position.z = 0.02; g.add(arc);
    for (const s of [-1, 1]) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.008, 28), m); r.rotation.x = Math.PI / 2; r.position.set(s * 0.048, 0, 0.004); g.add(r);
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.011, 14, 10), m); k.position.set(s * 0.048, 0, 0.012); g.add(k);
    }
    return g;
  },
};

// Emblèmes : à plat sur le couvercle, axe long vers la tête (+X).
function forme(points) { const s = new THREE.Shape(); points.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); return s; }
function plaqueEmbleme(f, ep, m) { const g = new THREE.ExtrudeGeometry(f, { depth: ep, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 1 }); g.rotateX(-Math.PI / 2); return new THREE.Mesh(g, m); }
function croix(long, larg, bras, posBras, m) {
  const g = new THREE.Group();
  const v = new THREE.Mesh(new THREE.BoxGeometry(long, 0.008, larg), m); g.add(v);
  const h = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.008, bras), m); h.position.x = posBras; g.add(h);
  return g;
}
const EMBLEMES = {
  sans: () => null,
  croix: () => {
    const m = metal('laiton'), g = croix(0.58, 0.022, 0.18, 0.15, m);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 4), m); p.rotation.z = -s * Math.PI / 2; p.scale.set(1, 1, 0.3); p.position.x = s * 0.31; g.add(p); }
    return g;
  },
  crucifix: () => {
    const m = metal('laiton-vieilli'), g = croix(0.45, 0.018, 0.17, 0.12, m);
    const c = new THREE.MeshStandardMaterial({ metalness: 1, color: 0x6E5130, roughness: 0.45 });
    const add = (geo, x, z, rx, ry, rz, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, c); o.position.set(x, 0.012, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); g.add(o); };
    add(new THREE.SphereGeometry(0.014, 16, 12), 0.165, 0, 0, 0, 0);
    add(new THREE.CapsuleGeometry(0.016, 0.06, 6, 12), 0.1, 0, 0, 0, Math.PI / 2, 1, 1, 0.7);
    for (const s of [-1, 1]) add(new THREE.CapsuleGeometry(0.0055, 0.07, 4, 8), 0.135, s * 0.045, 0, s * 0.55, Math.PI / 2);
    add(new THREE.CapsuleGeometry(0.009, 0.1, 4, 10), -0.005, 0, 0, 0, Math.PI / 2, 1, 1, 0.75);
    return g;
  },
  etoile: () => {
    const m = metal('dore'), g = new THREE.Group(), R = 0.1, r = 0.075;
    const tri = (rr, a0) => [0, 1, 2].map(k => [Math.cos(a0 + k * 2 * Math.PI / 3) * rr, Math.sin(a0 + k * 2 * Math.PI / 3) * rr]);
    for (const a0 of [0, Math.PI / 3]) { const f = forme(tri(R, a0)); f.holes.push(new THREE.Path(tri(r, a0).map(p => new THREE.Vector2(p[0], p[1])))); g.add(plaqueEmbleme(f, 0.006, m)); }
    g.children[1].position.y = 0.002;
    return g;
  },
  huguenote: () => {
    const m = metal('bronze'), g = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const b = plaqueEmbleme(forme([[0.008, 0], [0.06, -0.035], [0.05, 0], [0.06, 0.035]]), 0.006, m);
      const pv = new THREE.Group(); pv.add(b); pv.rotation.y = k * Math.PI / 2; g.add(pv);
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 8), m); p.position.set(Math.cos(k * Math.PI / 2) * 0.062 - Math.sin(k * Math.PI / 2) * s * 0.036, 0.004, -(Math.sin(k * Math.PI / 2) * 0.062 + Math.cos(k * Math.PI / 2) * s * 0.036)); g.add(p); }
    }
    const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.0035, 8, 48), m); anneau.rotation.x = Math.PI / 2; anneau.position.y = 0.003; g.add(anneau);
    const colombe = plaqueEmbleme(forme([[0, 0], [0.012, 0.03], [0.004, 0.012], [0, 0.026], [-0.004, 0.012], [-0.012, 0.03]]), 0.005, m);
    colombe.rotation.y = -Math.PI / 2; colombe.position.x = 0.072; g.add(colombe);
    return g;
  },
  rose: () => {
    const m = metal('bronze'), g = new THREE.Group();
    const tige = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.19, 0.004, 0.01), new THREE.Vector3(-0.08, 0.004, -0.012), new THREE.Vector3(0.04, 0.004, 0.008), new THREE.Vector3(0.12, 0.004, 0)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(tige, 40, 0.004, 8), m));
    for (const [x, s, a] of [[-0.11, 1, 0.6], [-0.03, -1, -0.5], [0.05, 1, 0.7]]) {
      const f = new THREE.Shape(); f.moveTo(0, 0); f.quadraticCurveTo(0.025, 0.018, 0.055, 0); f.quadraticCurveTo(0.025, -0.018, 0, 0);
      const fe = plaqueEmbleme(f, 0.003, m); fe.rotation.y = s * a; fe.position.set(x, 0.002, 0); g.add(fe);
    }
    const fleur = new THREE.Group(); fleur.position.set(0.15, 0.012, 0);
    [[0.03, 0.005], [0.022, 0.0045], [0.014, 0.004]].forEach(([R, r], i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(R, r, 8, 32), m); t.rotation.x = Math.PI / 2; t.position.y = i * 0.006; fleur.add(t); });
    const coeur = new THREE.Mesh(new THREE.SphereGeometry(0.012, 14, 10), m); coeur.position.y = 0.014; fleur.add(coeur);
    g.add(fleur);
    return g;
  },
};

function textureGravure(l1, l2) {
  const c = document.createElement('canvas'); c.width = 700; c.height = 440;
  const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 700, 440); gr.addColorStop(0, '#E7C980'); gr.addColorStop(0.5, '#C9A35A'); gr.addColorStop(1, '#E1C077');
  x.fillStyle = gr; x.fillRect(0, 0, 700, 440);
  for (let i = 0; i < 440; i += 2) { x.fillStyle = `rgba(255,255,255,${(i * 7919 % 13) / 260})`; x.fillRect(0, i, 700, 1); }
  x.strokeStyle = 'rgba(90,64,25,.55)'; x.lineWidth = 6; x.strokeRect(22, 22, 656, 396);
  x.fillStyle = 'rgba(70,48,18,.92)'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '500 64px "Cormorant Garamond", Garamond, serif'; x.fillText(l1 || 'Prénom Nom', 350, 190, 600);
  x.font = 'italic 400 44px "Cormorant Garamond", Garamond, serif'; x.fillText(l2 || '1940 – 2026', 350, 280, 600);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function textureOmbre() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, 'rgba(27,42,65,.42)'); g.addColorStop(0.55, 'rgba(27,42,65,.14)'); g.addColorStop(1, 'rgba(27,42,65,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function creerVue(canvas, { auChangement } = {}) {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rendu = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  rendu.outputColorSpace = THREE.SRGBColorSpace;
  rendu.toneMapping = THREE.LinearToneMapping; rendu.toneMappingExposure = 1.0;
  rendu.shadowMap.enabled = true; rendu.shadowMap.type = THREE.PCFSoftShadowMap; rendu.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(rendu);
  scene.environment = pm.fromScene(new RoomEnvironment(rendu), 0.04).texture;

  const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  cam.position.set(2.5, 1.45, 2.7);
  const ctl = new OrbitControls(cam, canvas);
  ctl.target.set(0, 0.24, 0); ctl.enableDamping = true; ctl.dampingFactor = 0.08; ctl.enablePan = false;
  ctl.minDistance = 1.2; ctl.maxDistance = 6; ctl.maxPolarAngle = Math.PI * 0.49;
  ctl.autoRotate = !reduit; ctl.autoRotateSpeed = 0.7;
  ctl.addEventListener('start', () => { ctl.autoRotate = false; anim = null; });
  let sale = true;
  ctl.addEventListener('change', () => { sale = true; });

  const soleil = new THREE.DirectionalLight(0xfff4e6, 0.4); soleil.position.set(0.4, 4.2, 0); soleil.castShadow = true;
  soleil.shadow.mapSize.set(1024, 1024); Object.assign(soleil.shadow.camera, { left: -1.4, right: 1.4, top: 1.4, bottom: -1.4 }); soleil.shadow.radius = 6; soleil.shadow.bias = -0.0004;
  // Éclairage de studio : deux boîtes à lumière latérales, pour un rendu égal sous tous les angles
  const boite1 = new THREE.DirectionalLight(0xfff6ec, 0.9); boite1.position.set(1.2, 1.6, 3);
  const boite2 = new THREE.DirectionalLight(0xfff6ec, 0.9); boite2.position.set(-1.2, 1.6, -3);
  scene.add(soleil, boite1, boite2, new THREE.HemisphereLight(0xffffff, 0xd8cbb4, 0.3));
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.16 })); sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.95), new THREE.MeshBasicMaterial({ map: textureOmbre(), transparent: true, depthWrite: false })); contact.rotation.x = -Math.PI / 2; contact.position.y = 0.001; scene.add(contact);

  const cercueil = new THREE.Group(); scene.add(cercueil);
  const chargeur = new THREE.TextureLoader();
  let charniere = null, couvercle = null, plaque = null, hautCouvercle = Y_HAUT, ouvert = 0, cible = 0, anim = null;
  const cacheBois = {};
  const bois = (hex, fin) => {
    const k = hex + fin;
    if (!cacheBois[k]) {
      const map = textureBois(hex);
      cacheBois[k] = new THREE.MeshPhysicalMaterial({ map, bumpMap: map, bumpScale: 0.25, roughness: fin === 'brillant' ? 0.4 : 0.58, clearcoat: fin === 'brillant' ? 0.55 : 0.2, clearcoatRoughness: fin === 'brillant' ? 0.22 : 0.4, envMapIntensity: 0.45 });
    }
    return cacheBois[k];
  };

  function vider(o) { o.traverse(c => { if (c.geometry) c.geometry.dispose(); }); o.clear(); }
  function maillage(g, m, ombre = true) { const o = new THREE.Mesh(g, m); o.castShadow = ombre; o.receiveShadow = true; return o; }

  function construire(cfg) {
    vider(cercueil);
    const F = FORMES[cfg.modele], mb = bois(cfg.teinte, F.finition), prof = PROFILS[F.profil];
    const sombre = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.teinte).multiplyScalar(0.42), roughness: 0.7 });
    // Socle en couches
    let ys = 0;
    for (const [h, d] of F.socle) { cercueil.add(maillage(uvBois(extrude(contour(d), h, ys, 0.002)), mb)); ys += h; }
    const H = Y_HAUT - ys, yT = t => ys + H * t;
    // Caisse creuse, épaisseur 22 mm, en tranches pour suivre le galbe
    if (F.profil === 'droit') {
      const f = contour(0); f.holes.push(trou(-EP));
      cercueil.add(maillage(uvBois(extrude(f, H, ys, 0.002)), mb));
    } else {
      // Flanc galbé d'une seule surface continue, paroi intérieure et chant à part
      const n = 32;
      for (let i = 0; i < n; i++) cercueil.add(maillage(uvBois(tronc(prof(i / n), prof((i + 1) / n), ys + i * H / n, H / n, false, false)), mb));
      const paroi = contour(-EP + 0.001); paroi.holes.push(trou(-EP));
      cercueil.add(maillage(uvBois(extrude(paroi, H, ys, 0)), mb));
      const chant = contour(prof(1)); chant.holes.push(trou(-EP));
      cercueil.add(maillage(uvBois(extrude(chant, 0.003, Y_HAUT - 0.003, 0)), mb));
    }
    for (const [tb, d, h] of F.bandeaux || []) { const f = contour(prof(tb) + d); f.holes.push(trou(-EP)); cercueil.add(maillage(uvBois(extrude(f, h, yT(tb) - h / 2, 0.004)), mb)); }
    for (const tr of F.rainures || []) { const f = contour(prof(tr) + 0.0008); f.holes.push(trou(-EP)); cercueil.add(maillage(extrude(f, 0.004, yT(tr), 0), sombre, false)); }
    // Intérieur : capiton, fond et oreiller
    const satin = new THREE.MeshStandardMaterial({ map: textureSatin(cfg.capiton, true), roughness: 0.38, metalness: 0.05 });
    const lit = new THREE.MeshStandardMaterial({ map: textureSatin(cfg.capiton, false), roughness: 0.42, metalness: 0.04 });
    const doublure = contour(-EP - 0.001); doublure.holes.push(trou(-EP - 0.008));
    cercueil.add(maillage(extrude(doublure, H - 0.03, ys + 0.02, 0), satin, false));
    cercueil.add(maillage(extrude(contour(-EP - 0.004), 0.07, ys + 0.02, 0.01), lit, false));
    const or = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), lit); or.scale.set(0.15, 0.045, 0.17); or.position.set(L / 2 - 0.26, ys + 0.1, 0); or.receiveShadow = true; cercueil.add(or);
    // Poignées
    const mp = metal(cfg.metal), pente = (HS - HF) / (XS + L / 2), ang = Math.atan(pente);
    const xs = F.poignees.x, tp = F.poignees.t, dp = prof(tp);
    for (const x of xs) for (const s of [1, -1]) {
      const p = POIGNEES[cfg.poignee](mp), z = HF + (x + L / 2) * pente + dp;
      p.position.set(x, yT(tp), s * z); p.rotation.y = s > 0 ? -ang : Math.PI + ang;
      p.traverse(c => { if (c.isMesh) c.castShadow = true; });
      cercueil.add(p);
    }
    // Gravure florale : relief relevé sur la photo du modèle réel
    if (F.gravure) {
      const relief = chargeur.load('images/catalogue/gravure-relief.webp', () => { sale = true; }); relief.channel = 1;
      const masque = masqueGravure(); masque.channel = 1;
      const mg = new THREE.MeshPhysicalMaterial({ map: mb.map, bumpMap: relief, bumpScale: 5, alphaMap: masque, transparent: true, roughness: mb.roughness, clearcoat: mb.clearcoat, clearcoatRoughness: mb.clearcoatRoughness, envMapIntensity: 0.45, polygonOffset: true, polygonOffsetFactor: -2 });
      for (const s of [1, -1]) {
        const g = new THREE.PlaneGeometry(0.97, 0.18);
        g.setAttribute('uv1', g.attributes.uv.clone());
        const pl = new THREE.Mesh(g, mg);
        const x = -0.17, z = HF + (x + L / 2) * pente + 0.0045;
        pl.position.set(x, yT(0.47), s * z); pl.rotation.y = s > 0 ? -ang : Math.PI + ang;
        // Le fil du bois suit les mêmes coordonnées que la caisse
        pl.updateMatrixWorld(); const pos = g.attributes.position, uv = g.attributes.uv, w = new THREE.Vector3();
        for (let k = 0; k < pos.count; k++) { w.fromBufferAttribute(pos, k).applyMatrix4(pl.matrixWorld); uv.setXY(k, w.x * 0.5, (w.y + w.z) * 0.9); }
        cercueil.add(pl);
      }
    }
    // Couvercle monté sur une charnière, pour l'ouvrir sans le perdre de vue
    charniere = new THREE.Group(); charniere.position.set(0, Y_HAUT, -(HS + 0.012)); cercueil.add(charniere);
    couvercle = new THREE.Group(); couvercle.position.set(0, -Y_HAUT, HS + 0.012); charniere.add(couvercle);
    let y = Y_HAUT;
    COUVERCLES[F.couvercle].forEach(([h, d0, d1], i) => { couvercle.add(maillage(uvBois(tronc(d0, d1, y, h, i === 0)), mb)); y += h; });
    hautCouvercle = y;
    // Cache-vis dorés sur la tranche du couvercle
    if (F.vis) {
      const mv = metal('laiton'), g = new THREE.SphereGeometry(0.0055, 12, 8), q = points(COUVERCLES[F.couvercle][0][1] + 0.001), yv = Y_HAUT + COUVERCLES[F.couvercle][0][0] * 0.5;
      for (let i = 0; i < 6; i++) {
        const a = q[i], b = q[(i + 1) % 6], lg = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(lg / 0.14));
        for (let j = 0; j < k; j++) { const f = (j + 0.5) / k, v = new THREE.Mesh(g, mv); v.position.set(a[0] + (b[0] - a[0]) * f, yv, -(a[1] + (b[1] - a[1]) * f)); couvercle.add(v); }
      }
    }
    // Emblème et plaque
    const e = EMBLEMES[cfg.embleme]?.();
    if (e) { e.position.set(0.12, y + 0.002, 0); e.traverse(c => { if (c.isMesh) c.castShadow = true; }); couvercle.add(e); }
    plaque = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.004, 0.11), [metal('laiton'), metal('laiton'), new THREE.MeshStandardMaterial({ map: textureGravure(cfg.l1, cfg.l2), metalness: 0.85, roughness: 0.32 }), metal('laiton'), metal('laiton'), metal('laiton')]);
    plaque.position.set(-0.5, y + 0.002, 0); plaque.castShadow = true; couvercle.add(plaque);
    poserCouvercle();
    rendu.shadowMap.needsUpdate = true; sale = true;
  }

  function masqueGravure() {
    const c = document.createElement('canvas'); c.width = 730; c.height = 136;
    const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 730, 136);
    x.filter = 'blur(3px)'; x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(10, 126); x.lineTo(90, 6); x.lineTo(720, 6); x.lineTo(654, 126); x.closePath(); x.fill();
    return new THREE.CanvasTexture(c);
  }

  function poserCouvercle() {
    if (!charniere) return;
    const e = ouvert * ouvert * (3 - 2 * ouvert);
    charniere.rotation.x = -1.72 * e;
  }

  // Vues prédéfinies
  const VUES = {
    troisquarts: [new THREE.Vector3(2.5, 1.45, 2.7), new THREE.Vector3(0, 0.24, 0)],
    profil: [new THREE.Vector3(0.05, 0.42, 3.6), new THREE.Vector3(0, 0.24, 0)],
    dessus: [new THREE.Vector3(0.02, 4.7, 0.45), new THREE.Vector3(0, 0.2, 0)],
    tete: [new THREE.Vector3(2.9, 0.75, 0.9), new THREE.Vector3(0.3, 0.26, 0)],
    interieur: [new THREE.Vector3(1.75, 2.15, 2.35), new THREE.Vector3(0, 0.28, -0.1)],
  };
  function vue(nom) {
    ctl.autoRotate = false;
    const [p, t] = VUES[nom];
    anim = { p0: cam.position.clone(), t0: ctl.target.clone(), p, t, d: 0 };
  }

  let actif = false, dernier = 0;
  function boucle(ts) {
    if (!actif) return;
    requestAnimationFrame(boucle);
    const dt = Math.min(0.05, (ts - dernier) / 1000 || 0.016); dernier = ts;
    if (anim) {
      anim.d = Math.min(1, anim.d + dt * (reduit ? 10 : 1.4));
      const k = 1 - Math.pow(1 - anim.d, 3);
      cam.position.lerpVectors(anim.p0, anim.p, k); ctl.target.lerpVectors(anim.t0, anim.t, k);
      if (anim.d >= 1) anim = null;
    }
    if (ouvert !== cible) { ouvert = cible > ouvert ? Math.min(cible, ouvert + dt * (reduit ? 10 : 1.2)) : Math.max(cible, ouvert - dt * (reduit ? 10 : 1.2)); poserCouvercle(); rendu.shadowMap.needsUpdate = true; sale = true; }
    if (anim) sale = true;
    ctl.update();
    if (sale) { sale = false; rendu.render(scene, cam); }
  }
  function taille() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    rendu.setSize(w, h, false); cam.aspect = w / h;
    cam.fov = w / h < 1 ? 36 : 30; cam.updateProjectionMatrix(); sale = true;
  }
  const ro = new ResizeObserver(taille); ro.observe(canvas);

  return {
    afficher(cfg) { construire(cfg); taille(); auChangement && auChangement(); },
    graver(l1, l2) { if (plaque) { plaque.material[2].map.dispose(); plaque.material[2].map = textureGravure(l1, l2); plaque.material[2].needsUpdate = true; sale = true; } },
    vue,
    poser(p, c) { ctl.autoRotate = false; anim = null; cam.position.set(...p); ctl.target.set(...c); ctl.update(); sale = true; },
    couvercle(o) { cible = o ? 1 : 0; if (o) vue('interieur'); else vue('troisquarts'); },
    demarrer() { if (!actif) { actif = true; sale = true; taille(); requestAnimationFrame(boucle); } },
    arreter() { actif = false; },
    tourner(a) { ctl.autoRotate = false; const o = cam.position.clone().sub(ctl.target); o.applyAxisAngle(new THREE.Vector3(0, 1, 0), a); anim = { p0: cam.position.clone(), t0: ctl.target.clone(), p: ctl.target.clone().add(o), t: ctl.target.clone(), d: 0 }; },
    zoomer(f) { ctl.autoRotate = false; const o = cam.position.clone().sub(ctl.target).multiplyScalar(f); const lgr = THREE.MathUtils.clamp(o.length(), ctl.minDistance, ctl.maxDistance); o.setLength(lgr); anim = { p0: cam.position.clone(), t0: ctl.target.clone(), p: ctl.target.clone().add(o), t: ctl.target.clone(), d: 0 }; },
  };
}
