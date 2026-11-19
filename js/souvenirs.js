/* Lignée · Souvenirs : fiches produit (souvenirs.html), page de paiement (commande.html), confirmation (merci.html).
   Tout se règle ici : prix, textes, liens de paiement Stripe.

   PAIEMENT. Pour chaque objet à prix fixe, créer dans Stripe un « Payment Link » (Produits → Liens de paiement) :
   - prix TTC identique à celui ci-dessous, « Autoriser les clients à ajuster la quantité » coché (1 à 10) ;
   - Après le paiement → « Rediriger vers votre site » : https://maison-lignee.fr/merci.html?paye=1
   puis coller le lien (https://buy.stripe.com/...) dans STRIPE ci-dessous.
   Tant qu'un lien est vide, la commande est quand même enregistrée (e-mail Web3Forms) et le client
   est prévenu qu'il reçoit son lien de paiement sécurisé par e-mail. */
(function(){
  'use strict';

  var STRIPE={
    coussin:'https://buy.stripe.com/9B6aEZcr85FW4IMenfaVa0Q',
    doudou:'https://buy.stripe.com/fZu6oJ3UCecs4IMa6ZaVa0P',
    cadre:'https://buy.stripe.com/00w14p76O8S8gru6UNaVa0R',
    boite:'https://buy.stripe.com/7sYeVf62Kfgw7UY6UNaVa0S',
    empreinte:'https://buy.stripe.com/dRm4gBezg5FW3EI4MFaVa0T',
    ecriture:'https://buy.stripe.com/fZu14p9eWc4k1wAdjbaVa0U',
    meche:'https://buy.stripe.com/14A14pgHofgw8Z21AtaVa0V'
  };
  var CLE='264f0919-dc05-41b5-aeb6-cbdd337fcb32'; // Web3Forms (même clé que les formulaires du site)

  var I={
    coussin:'<path d="M10 13Q24 7 38 13Q43 24 38 35Q24 41 10 35Q5 24 10 13Z"/><circle cx="24" cy="24" r="1.6"/><path d="M15 18Q24 15 33 18M15 30Q24 33 33 30"/>',
    doudou:'<circle cx="24" cy="18" r="8"/><circle cx="17" cy="11" r="3"/><circle cx="31" cy="11" r="3"/><path d="M15 40Q14 26 24 26Q34 26 33 40Z"/><path d="M22 19h.01M26 19h.01M23 22q1 1 2 0"/>',
    boite:'<rect x="8" y="18" width="32" height="20" rx="1.5"/><path d="M6 18h36v-5H6z"/><path d="M12 25q6-3 12 0t12 0M12 31q6-3 12 0t12 0"/>',
    cadre:'<rect x="9" y="7" width="30" height="34" rx="1"/><rect x="14" y="12" width="20" height="24"/><path d="M14 30l6-6 5 5 3-3 6 6"/>',
    empreinte:'<path d="M10 6Q24 22 38 6"/><path d="M24 20v3"/><circle cx="24" cy="31" r="8"/><path d="M20 31q4-5 8 0M21.5 34q2.5-3 5 0M19 28q5-6 10 0"/>',
    ecriture:'<rect x="7" y="12" width="34" height="24" rx="1.5"/><path d="M7 13l17 13 17-13"/>',
    meche:'<path d="M24 39S8 29.5 8 18.5A8 8 0 0 1 24 15a8 8 0 0 1 16 3.5C40 29.5 24 39 24 39z"/>',
    film:'<rect x="7" y="11" width="34" height="26" rx="2"/><path d="M7 17h34M7 31h34M13 11v6M21 11v6M29 11v6M37 11v6M13 31v6M21 31v6M29 31v6M37 31v6"/><path d="M21 21v6l5-3z"/>',
    livre:'<path d="M24 14C18 10 10 10 6 12V36C10 34 18 34 24 38C30 34 38 34 42 36V12C38 10 30 10 24 14Z"/><path d="M24 14V38"/>',
    arbre:'<circle cx="24" cy="9" r="3.5"/><circle cx="12" cy="24" r="3.5"/><circle cx="36" cy="24" r="3.5"/><circle cx="7" cy="39" r="3"/><circle cx="18" cy="39" r="3"/><circle cx="36" cy="39" r="3"/><path d="M24 12.5V17H12v3.5M24 17h12v3.5M12 27.5V32H7v4M12 32h6v4M36 27.5V36"/>'
  };

  // Étapes communes après le paiement (engagements à tenir : kit d'envoi sous 24 h ouvrées, photo avant expédition).
  var ETAPES_TEXTILE=[
    ['Vous payez en ligne','Confirmation immédiate par e-mail. Sous 24 h ouvrées, vous recevez votre étiquette d\'envoi prépayée.'],
    ['Vous nous confiez ses affaires','Quand vous êtes prêt, sans délai imposé. Nous vous prévenons dès réception.'],
    ['Nous confectionnons','Dans notre atelier, à la main. Une photo de l\'objet terminé vous est envoyée avant l\'expédition.'],
    ['Vous recevez','L\'objet, et ce qui reste de ses affaires, livrés chez vous. Livraison offerte en France métropolitaine.']
  ];
  var ETAPES_BOIS=[
    ['Vous payez en ligne','Confirmation immédiate par e-mail. Nous vous appelons sous 24 h ouvrées pour organiser l\'envoi du bois.'],
    ['Vous nous confiez le bois','Un tiroir, une planche, un pied de table. Trop lourd ou trop grand ? Nous trouvons une solution avec vous.'],
    ['Nous façonnons','Dans notre atelier. Une photo de l\'objet terminé vous est envoyée avant l\'expédition.'],
    ['Vous recevez','L\'objet livré chez vous, avec les chutes de bois si vous le souhaitez. Livraison offerte en France métropolitaine.']
  ];
  var ETAPES_BIJOU=[
    ['Vous payez en ligne','Confirmation immédiate par e-mail, avec les indications pour nous transmettre ce qu\'il faut.'],
    ['Vous nous transmettez','Une photo ou l\'original, selon le bijou. Nous vous prévenons dès réception.'],
    ['Nous réalisons','Une épreuve vous est soumise avant la réalisation. Rien n\'est gravé sans votre accord.'],
    ['Vous recevez','Le bijou dans son écrin, livré chez vous. Livraison offerte en France métropolitaine.']
  ];
  var ETAPES_DEVIS=[
    ['Vous décrivez','Ce que vous avez gardé, ce que vous aimeriez. Quelques lignes suffisent.'],
    ['Nous chiffrons','Devis gratuit sous 48 heures, à prix ferme. Rien n\'est fait sans votre accord.'],
    ['Nous réalisons','Vous suivez l\'avancement, nous vous montrons le résultat avant la livraison.']
  ];

  // Mentions marquées « à valider » dans le README : dimensions, délais, matières.
  var P={
    doudou:{nom:'Doudou',prix:89,famille:'Fait dans nos ateliers',visuel:'videos/couture-gros-plan.jpg',
      accroche:'Un ours cousu dans un vêtement de votre proche. Un souvenir à serrer, pour les petits-enfants comme pour les grands.',
      recu:['Un ours d\'environ 30 cm, cousu à la main dans le vêtement choisi','Une étiquette cousue avec son prénom','Garnissage neuf, doux et lavable à 30 °C','Le reste du vêtement vous est rendu'],
      confier:'Un seul vêtement en tissu : pull, chemise, robe, pyjama, polaire. Même s\'il est un peu usé, c\'est souvent possible.',
      delai:'Environ 3 semaines après réception du vêtement.',etapes:ETAPES_TEXTILE,
      faq:[['Je n\'ai pas encore trié ses affaires.','Commandez quand vous voulez : vous nous envoyez le vêtement quand vous êtes prêt, sans délai imposé.'],['Un vêtement pour plusieurs doudous ?','Souvent oui, avec un pull ou une chemise d\'adulte. Indiquez-le dans votre commande, nous vous confirmons.'],['Et si le tissu ne convient pas ?','Nous vous appelons. Si rien n\'est possible, vous êtes remboursé intégralement et le vêtement vous est rendu.']]},
    coussin:{nom:'Coussin',prix:59,famille:'Fait dans nos ateliers',visuel:'videos/couture-machine.jpg',
      accroche:'Confectionné dans ses chemises, ses pulls ou son écharpe préférée. Un objet du quotidien, qui garde sa présence.',
      recu:['Un coussin de 40 × 40 cm, garnissage inclus','Les boutons de sa chemise conservés en façade','Housse amovible, lavable','Le reste du vêtement vous est rendu'],
      confier:'Une chemise, un pull ou une écharpe. Vous pouvez associer deux vêtements (devant et dos).',
      delai:'Environ 3 semaines après réception du vêtement.',etapes:ETAPES_TEXTILE,
      faq:[['Je n\'ai pas encore trié ses affaires.','Commandez quand vous voulez : vous nous envoyez le vêtement quand vous êtes prêt, sans délai imposé.'],['Un coussin pour chaque enfant ?','À partir de trois objets, le quatrième est offert. Une chemise d\'adulte donne souvent deux coussins.'],['Et si le tissu ne convient pas ?','Nous vous appelons. Si rien n\'est possible, vous êtes remboursé intégralement et le vêtement vous est rendu.']]},
    cadre:{nom:'Cadre',prix:69,famille:'Fait dans nos ateliers',visuel:'videos/bois-poncage.jpg',
      accroche:'Le bois d\'une commode ou d\'une table, transformé en cadre pour sa plus belle photo.',
      recu:['Un cadre en bois massif pour une photo 13 × 18 cm','Verre de protection et pied ou attache murale','Votre photo tirée et mise en place si vous nous l\'envoyez','Les chutes de bois rendues si vous le souhaitez'],
      confier:'Un élément de meuble en bois : tiroir, planche, pied de table, étagère. Et la photo à encadrer, sur papier ou par e-mail.',
      delai:'Environ 3 semaines après réception du bois.',etapes:ETAPES_BOIS,
      faq:[['Le meuble est trop gros à envoyer.','Un seul tiroir ou une planche suffit. Sinon, nous vous appelons pour trouver une solution.'],['Le bois est abîmé.','Nous le ponçons et le traitons : les marques du temps font souvent la beauté du cadre.'],['Et si le bois ne convient pas ?','Nous vous appelons. Si rien n\'est possible, vous êtes remboursé intégralement et le bois vous est rendu.']]},
    boite:{nom:'Boîte en bois',prix:149,famille:'Fait dans nos ateliers',visuel:'videos/bois-poncage.jpg',
      accroche:'Taillée dans le bois de ses meubles, pour y garder lettres, photos et petits objets.',
      recu:['Une boîte d\'environ 25 × 18 × 10 cm, avec couvercle','Intérieur doublé de tissu (le sien, si vous le souhaitez)','Son prénom gravé sur le couvercle, sur demande','Les chutes de bois rendues si vous le souhaitez'],
      confier:'Un élément de meuble en bois : tiroir, planche, plateau, pied de table. Un vêtement pour la doublure, si vous le souhaitez.',
      delai:'Environ 4 semaines après réception du bois.',etapes:ETAPES_BOIS,
      faq:[['Le meuble est trop gros à envoyer.','Un seul tiroir ou une planche suffit. Sinon, nous vous appelons pour trouver une solution.'],['Que mettre dedans ?','Lettres, photos, montre, bijoux, petits objets : ce qui raconte sa vie.'],['Et si le bois ne convient pas ?','Nous vous appelons. Si rien n\'est possible, vous êtes remboursé intégralement et le bois vous est rendu.']]},
    empreinte:{nom:'Bijou empreinte digitale',prix:129,famille:'Bijoux mémoriels',visuel:'videos/photos-mains.jpg',variantes:['Pendentif','Bague','Bracelet'],
      accroche:'Son empreinte digitale gravée sur un pendentif, une bague ou un bracelet. Une trace unique, portée près de soi.',
      recu:['Un bijou au choix : pendentif, bague ou bracelet','Son empreinte gravée, fidèle au moindre sillon','Son prénom ou une date gravés au dos, sur demande','Livré dans un écrin'],
      confier:'Une photo nette d\'une empreinte existante (encre, document officiel) ou l\'empreinte relevée par la pompe funèbre. Nous vous guidons.',
      delai:'Environ 3 semaines après validation de l\'épreuve.',etapes:ETAPES_BIJOU,
      faq:[['Je n\'ai pas d\'empreinte.','Demandez-la à la pompe funèbre avant la mise en bière : nous vous expliquons comment, c\'est simple et gratuit.'],['La taille de la bague ?','Nous vous la demandons après la commande, avec un guide des tailles.'],['Un bijou avec ses cendres ?','Non : la loi l\'interdit, et nous la respectons.']]},
    ecriture:{nom:'Bijou écriture manuscrite',prix:129,famille:'Bijoux mémoriels',visuel:'videos/photos-boite.jpg',variantes:['Pendentif','Bague','Bracelet'],
      accroche:'Quelques mots de sa main, reproduits sur un bijou : sa signature, « Je t\'aime », votre prénom écrit par lui ou par elle.',
      recu:['Un bijou au choix : pendentif, bague ou bracelet','Son écriture reproduite trait pour trait','Une épreuve à valider avant la gravure','Livré dans un écrin'],
      confier:'Une photo ou un scan d\'une lettre, d\'une carte ou d\'une signature. L\'original reste chez vous.',
      delai:'Environ 3 semaines après validation de l\'épreuve.',etapes:ETAPES_BIJOU,
      faq:[['Quels mots choisir ?','Un prénom, une signature, une formule de fin de lettre. Nous vous aidons à choisir ce qui rendra le mieux.'],['La taille de la bague ?','Nous vous la demandons après la commande, avec un guide des tailles.'],['Un bijou avec ses cendres ?','Non : la loi l\'interdit, et nous la respectons.']]},
    meche:{nom:'Bijou mèche de cheveux',prix:149,famille:'Bijoux mémoriels',visuel:'videos/photos-mains.jpg',variantes:['Pendentif','Bague','Bracelet'],
      accroche:'Une mèche de ses cheveux sertie dans un pendentif, une bague ou un bracelet. Quelque chose de lui ou d\'elle, toujours avec vous.',
      recu:['Un bijou au choix : pendentif, bague ou bracelet','La mèche sertie sous verre, scellée','Son prénom ou une date gravés au dos, sur demande','Livré dans un écrin'],
      confier:'Une petite mèche de cheveux, envoyée dans l\'enveloppe que nous vous adressons.',
      delai:'Environ 3 semaines après réception de la mèche.',etapes:ETAPES_BIJOU,
      faq:[['Comment prélever la mèche ?','La pompe funèbre peut le faire avant la mise en bière. Une mèche gardée d\'un enfant convient aussi.'],['La taille de la bague ?','Nous vous la demandons après la commande, avec un guide des tailles.'],['Un bijou avec ses cendres ?','Non : la loi l\'interdit, et nous la respectons.']]},
    numerisation:{nom:'Numérisation',devis:'Numérisation de photos ou films',famille:'Ses images, ses mots',icone:'film',visuel:'videos/photos-boite.jpg',
      accroche:'Photos, diapositives, films et cassettes numérisés, partagés avec toute la famille.',
      recu:['Photos, diapositives, négatifs, films 8 mm, cassettes VHS','Fichiers classés, partagés par un lien à toute la famille','Les originaux vous sont rendus'],
      confier:'Vos boîtes de photos, films ou cassettes. Le prix dépend de la quantité : décrivez-nous ce que vous avez.',
      delai:'Devis gratuit sous 48 heures.',etapes:ETAPES_DEVIS},
    livre:{nom:'Livre souvenir',devis:'Livre souvenir',famille:'Ses images, ses mots',icone:'livre',visuel:'videos/photos-boite.jpg',
      accroche:'Un livre imprimé qui raconte sa vie, avec ses photos et vos mots.',
      recu:['Mise en page de ses photos et de vos textes','Relecture et validation avant impression','Un exemplaire par membre de la famille, sur demande'],
      confier:'Ses photos et, si vous le souhaitez, quelques souvenirs écrits. Nous vous aidons à les rassembler.',
      delai:'Devis gratuit sous 48 heures.',etapes:ETAPES_DEVIS},
    film:{nom:'Film hommage',devis:'Film hommage',famille:'Ses images, ses mots',icone:'film',visuel:'videos/photos-mains.jpg',
      accroche:'Un film court à partir de ses photos et vidéos, à projeter lors de la cérémonie ou à garder.',
      recu:['Un film de 3 à 8 minutes, en musique','Pour la cérémonie ou à partager en famille','Livré en fichier, prêt à projeter'],
      confier:'Ses photos et vidéos, et la musique qu\'il ou elle aimait.',
      delai:'Devis gratuit sous 48 heures. Délai court possible pour une cérémonie.',etapes:ETAPES_DEVIS},
    arbre:{nom:'Arbre généalogique',devis:'Arbre généalogique',famille:'Ses images, ses mots',icone:'arbre',visuel:'videos/photos-boite.jpg',
      accroche:'Votre lignée retracée et mise en forme, à encadrer ou à offrir.',
      recu:['Recherches à partir de ce que vous savez déjà','Mise en forme soignée, prête à encadrer','Un exemplaire par branche de la famille, sur demande'],
      confier:'Les noms, dates et lieux que vous connaissez, et les documents de famille.',
      delai:'Devis gratuit sous 48 heures.',etapes:ETAPES_DEVIS}
  };

  function eur(n){return n.toLocaleString('fr-FR')+' €';}
  function ico(k,cls){var p=P[k];return '<svg class="'+(cls||'')+'" viewBox="0 0 48 48" aria-hidden="true">'+I[p.icone||k]+'</svg>';}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function total(prix,q){return prix*(q-Math.floor(q/4));}
  var d=document;
  var CHECK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------- Fiche produit (souvenirs.html) ---------- */
  function fiches(){
    var cartes=[].slice.call(d.querySelectorAll('[data-fiche]'));
    if(!cartes.length)return;
    var dlg=d.createElement('dialog');dlg.className='fs';dlg.setAttribute('aria-labelledby','fs-titre');
    d.body.appendChild(dlg);
    var dernier=null;

    function rendre(k){
      var p=P[k],fixe=!p.devis;
      var h='<div class="fs-in">'
        +'<div class="fs-vue" style="background-image:url('+p.visuel+')"><div class="fs-voile"></div>'+ico(k,'fs-ico')
        +'<p class="fs-famille">'+esc(p.famille)+'</p></div>'
        +'<div class="fs-panneau"><button class="fs-fermer" type="button" aria-label="Fermer">×</button>'
        +'<p class="sur">'+(fixe?'Prix fixe · Fait main':'Sur devis gratuit')+'</p>'
        +'<h2 id="fs-titre">'+esc(p.nom)+'</h2><p class="fs-accroche">'+esc(p.accroche)+'</p>'
        +'<div class="fs-prix">'+(fixe?'<b>'+eur(p.prix)+'</b><span>TTC, livraison offerte<br>Paiement en ligne sécurisé</span>':'<b class="petit">Sur devis</b><span>Gratuit, sous 48 heures<br>Sans engagement</span>')+'</div>'
        +'<h3>Ce que vous recevez</h3><ul class="fs-liste">'+p.recu.map(function(r){return '<li>'+CHECK+esc(r)+'</li>';}).join('')+'</ul>'
        +'<h3>Ce que vous nous confiez</h3><p>'+esc(p.confier)+'</p>'
        +'<h3>Délai</h3><p>'+esc(p.delai)+'</p>'
        +'<h3>Comment ça se passe</h3><ol class="fs-etapes">'+p.etapes.map(function(e){return '<li><b>'+esc(e[0])+'</b><span>'+esc(e[1])+'</span></li>';}).join('')+'</ol>'
        +(fixe?'<ul class="fs-garanties"><li>'+CHECK+'Remboursé intégralement si ses affaires ne permettent pas la confection</li><li>'+CHECK+'Changement d\'avis : remboursé tant que la confection n\'a pas commencé</li><li>'+CHECK+'Ses affaires vous sont rendues, avec soin</li><li>'+CHECK+'À partir de trois objets, le quatrième est offert</li></ul>':'')
        +(p.faq?'<h3>Vos questions</h3><div class="fs-faq">'+p.faq.map(function(q){return '<details><summary>'+esc(q[0])+'</summary><p>'+esc(q[1])+'</p></details>';}).join('')+'</div>':'')
        +'<p class="fs-aide">Une question avant de commander ? <a href="contact.html#formulaire">Être rappelé</a> ou <a href="mailto:contact@lignee.fr">contact@lignee.fr</a></p>'
        +'</div>'
        +'<div class="fs-barre"><div><b>'+(fixe?eur(p.prix):'Devis gratuit')+'</b><span>'+(fixe?'Livraison offerte':'Réponse sous 48 h')+'</span></div>'
        +(fixe?'<a class="btn" href="commande.html?p='+k+'">Commander</a>':'<a class="btn fs-devis" href="#devis">Demander mon devis</a>')
        +'</div></div>';
      dlg.innerHTML=h;
      dlg.querySelector('.fs-fermer').addEventListener('click',fermer);
      var dv=dlg.querySelector('.fs-devis');
      if(dv)dv.addEventListener('click',function(){
        var sel=d.getElementById('s-objet');if(sel)sel.value=p.devis;
        fermer();
      });
    }
    function ouvrir(k,el){
      if(!P[k])return;
      dernier=el||null;rendre(k);
      if(typeof dlg.showModal==='function'){dlg.showModal();}else{dlg.setAttribute('open','');}
      d.documentElement.classList.add('fs-ouverte');
      dlg.querySelector('.fs-panneau').scrollTop=0;
      if(history.replaceState)history.replaceState(null,'','#'+k);
    }
    function fermer(){
      if(dlg.open){if(typeof dlg.close==='function')dlg.close();else dlg.removeAttribute('open');}
    }
    dlg.addEventListener('close',function(){
      d.documentElement.classList.remove('fs-ouverte');
      if(history.replaceState&&P[location.hash.slice(1)])history.replaceState(null,'',location.pathname+location.search);
      if(dernier)dernier.focus();
    });
    dlg.addEventListener('click',function(e){if(e.target===dlg)fermer();});
    cartes.forEach(function(c){
      c.addEventListener('click',function(e){e.preventDefault();ouvrir(c.getAttribute('data-fiche'),c);});
    });
    function depuisAncre(){var k=location.hash.slice(1);if(P[k])ouvrir(k,d.querySelector('[data-fiche="'+k+'"]'));}
    depuisAncre();addEventListener('hashchange',depuisAncre);
  }

  /* ---------- Page de paiement (commande.html) ---------- */
  function commande(){
    var zone=d.getElementById('commande');if(!zone)return;
    var k=(new URLSearchParams(location.search).get('p')||'').toLowerCase();
    var p=P[k];
    var choix=d.getElementById('choix'),form=d.getElementById('form-commande');
    if(!p||p.devis){
      zone.hidden=true;choix.hidden=false;
      choix.querySelector('.choix-grille').innerHTML=Object.keys(P).filter(function(x){return !P[x].devis;}).map(function(x){
        return '<a class="choix-carte" href="commande.html?p='+x+'">'+ico(x)+'<b>'+esc(P[x].nom)+'</b><span>'+eur(P[x].prix)+'</span></a>';
      }).join('');
      return;
    }
    d.title='Commander : '+p.nom+' · Lignée';
    var q=1;
    var $=function(s){return zone.querySelector(s);};
    $('.rc-ico').innerHTML=ico(k);
    $('.rc-nom').textContent=p.nom;
    $('.rc-famille').textContent=p.famille;
    $('.rc-delai').textContent=p.delai;
    $('.rc-liste').innerHTML=p.recu.map(function(r){return '<li>'+CHECK+esc(r)+'</li>';}).join('');
    $('.rc-pu').textContent=eur(p.prix);
    $('[data-retour]').href='souvenirs.html#'+k;
    form.elements.produit.value=p.nom;
    var v=d.getElementById('c-variante');
    if(p.variantes){
      v.parentNode.hidden=false;v.required=true;
      v.innerHTML='<option value="">Choisir</option>'+p.variantes.map(function(x){return '<option>'+x+'</option>';}).join('');
    }
    function maj(){
      $('.q-val').textContent=q;
      $('.q-moins').disabled=q<=1;$('.q-plus').disabled=q>=10;
      var t=total(p.prix,q),off=p.prix*q-t;
      $('.rc-q').textContent=q>1?'× '+q:'';
      var r=$('.rc-remise');r.hidden=!off;r.querySelector('b').textContent='− '+eur(off);
      $('.rc-total').textContent=eur(t);
      $('.payer-montant').textContent=eur(t);
      $('.q-note').textContent=q>=3&&q<4?'Ajoutez-en un quatrième : il est offert.':(off?'Le quatrième objet est offert.':'');
      form.elements.quantite.value=q;form.elements.total.value=eur(t);
    }
    $('.q-moins').addEventListener('click',function(){if(q>1){q--;maj();}});
    $('.q-plus').addEventListener('click',function(){if(q<10){q++;maj();}});
    maj();

    form.addEventListener('submit',function(e){
      e.preventDefault();
      var msg=form.querySelector('.form-msg'),btn=form.querySelector('.payer');
      if(!form.checkValidity()){form.reportValidity();return;}
      var num='LS-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
      var lien=STRIPE[k];
      form.elements.numero.value=num;
      var t=total(p.prix,q);
      var ordre={numero:num,produit:p.nom,cle:k,quantite:q,total:t,variante:v.value||'',email:form.elements.email.value,prenom:form.elements.nom.value.split(' ')[0],paiement:lien?'stripe':'lien'};
      try{localStorage.setItem('lignee-commande',JSON.stringify(ordre));}catch(err){}
      btn.disabled=true;btn.classList.add('en-cours');
      msg.hidden=false;msg.classList.remove('erreur');
      msg.textContent=lien?'Redirection vers le paiement sécurisé…':'Enregistrement de votre commande…';
      var fd=new FormData(form);
      fd.append('access_key',CLE);
      fd.append('subject','Lignée · Commande souvenir '+num+' · '+p.nom+' × '+q+' · '+eur(t)+(lien?' (paiement Stripe en cours)':' (lien de paiement à envoyer)'));
      var envoi=fetch('https://api.web3forms.com/submit',{method:'POST',body:fd,keepalive:true}).then(function(r){return r.json();});
      if(lien){
        var url=lien+(lien.indexOf('?')<0?'?':'&')+'prefilled_email='+encodeURIComponent(ordre.email)+'&client_reference_id='+encodeURIComponent(num);
        var parti=false,go=function(){if(!parti){parti=true;location.href=url;}};
        envoi.then(go,go);setTimeout(go,2500);
      }else{
        envoi.then(function(j){if(!j.success)throw new Error();location.href='merci.html';}).catch(function(){
          btn.disabled=false;btn.classList.remove('en-cours');
          msg.classList.add('erreur');
          msg.textContent="L'envoi n'a pas abouti. Réessayez, ou écrivez-nous à contact@lignee.fr en indiquant l'objet choisi.";
        });
      }
    });
  }

  /* ---------- Confirmation (merci.html) ---------- */
  function merci(){
    var z=d.getElementById('merci');if(!z)return;
    var o=null;try{o=JSON.parse(localStorage.getItem('lignee-commande')||'null');}catch(e){}
    var paye=/[?&]paye=1/.test(location.search);
    z.querySelector('[data-etat="paye"]').hidden=!paye;
    z.querySelector('[data-etat="attente"]').hidden=paye;
    if(o){
      z.querySelector('.m-recap').hidden=false;
      z.querySelector('.m-num').textContent=o.numero;
      z.querySelector('.m-obj').textContent=o.produit+(o.variante?' ('+o.variante.toLowerCase()+')':'')+(o.quantite>1?' × '+o.quantite:'');
      z.querySelector('.m-total').textContent=eur(o.total);
      z.querySelector('.m-mail').textContent=o.email;
      if(o.prenom)d.querySelector('.m-prenom').textContent=', '+o.prenom;
      var p=P[o.cle];
      if(p)z.querySelector('.m-etapes').innerHTML=p.etapes.slice(1).map(function(e){return '<li><b>'+esc(e[0])+'</b><span>'+esc(e[1])+'</span></li>';}).join('');
    }
  }

  fiches();commande();merci();
})();
