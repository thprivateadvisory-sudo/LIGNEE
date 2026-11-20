/* Lignée · paiement en ligne des souvenirs (doudou.html, coussin.html) et page merci.html.
   Le client paie dans la page (carte, Apple Pay, Google Pay) sans quitter le site.
   Le serveur api/worker.js calcule le prix lui-même : ce fichier ne fait qu'afficher.
   Si le serveur ne répond pas, la commande est enregistrée comme une réservation
   (e-mail Web3Forms) et Lignée envoie un lien de paiement. */
(function(){
  'use strict';
  var API='https://lignee-paiement.muddy-fog-dddb.workers.dev';
  var CLE_STRIPE='pk_live_51TOybqRmrarRZT7ezNz8gy54YSqyGtY5gY4g6RvyBxl7JWYAbFNFMadiSR7C1pKUnVnwDMRn8LrX3Ds0JeNlE5g400ndJUulYO';
  var CLE_FORM='264f0919-dc05-41b5-aeb6-cbdd337fcb32'; // Web3Forms
  var d=document;

  function chargerStripe(){
    return new Promise(function(ok,ko){
      if(window.Stripe)return ok();
      var sc=d.querySelector('script[data-stripe]');
      if(!sc){sc=d.createElement('script');sc.src='https://js.stripe.com/endive/stripe.js';sc.setAttribute('data-stripe','');d.head.appendChild(sc);}
      sc.addEventListener('load',function(){ok();});sc.addEventListener('error',ko);
      setTimeout(function(){if(window.Stripe)ok();else ko(new Error('stripe'));},12000);
    });
  }
  function style(){
    var st=d.createElement('style');
    st.textContent='.paiement-zone{display:grid;gap:1rem;padding:1.2rem;border:1px solid var(--ligne);border-radius:6px;background:var(--ivoire);scroll-margin-top:calc(var(--hdr,80px) + 1rem)}'
      +'.paiement-zone .ou{display:flex;align-items:center;gap:.8rem;font-size:.85rem;color:var(--ardoise);margin:0}'
      +'.paiement-zone .ou::before,.paiement-zone .ou::after{content:"";flex:1;height:1px;background:var(--ligne)}'
      +'#carte{min-height:120px}.form .btn.plein{width:100%;justify-self:stretch}.btn.en-cours{opacity:.7;cursor:wait}'
      +'.securite{display:flex;flex-wrap:wrap;gap:.3rem 1rem;font-size:.8rem;color:var(--ardoise);margin:0}'
      +'[hidden]{display:none!important}';
    d.head.appendChild(st);
  }

  /* ---------- Formulaire de commande ---------- */
  function commande(form){
    var produit=form.getAttribute('data-paiement'),titre=form.getAttribute('data-form')||'Commande souvenir';
    form.removeAttribute('data-form'); // ce fichier gère l'envoi lui-même
    var t=d.getElementById('d-taille'),q=d.getElementById('d-qte'),l=d.getElementById('d-livr'),tot=d.getElementById('d-total');
    var btn=form.querySelector('button[type=submit]'),msg=form.querySelector('.form-msg');
    btn.classList.add('plein');
    var zone=d.createElement('div');zone.className='paiement-zone';zone.id='paiement-zone';zone.hidden=true;
    zone.innerHTML='<div id="express"></div><p class="ou" hidden><span>ou payer par carte</span></p><div id="carte"></div>'
      +'<button class="btn plein" type="button" id="payer-carte">Payer <span class="montant"></span></button>';
    btn.insertAdjacentElement('afterend',zone);
    var secu=d.createElement('p');secu.className='securite';
    secu.innerHTML='<span>Paiement chiffré et sécurisé</span><span>Carte bancaire, Apple Pay, Google Pay</span><span>Aucune donnée bancaire stockée par Lignée</span>';
    zone.insertAdjacentElement('afterend',secu);
    var payer=zone.querySelector('#payer-carte'),sess=null;

    function montant(){return (tot&&tot.textContent||'').trim();}
    function libelle(){
      btn.textContent='Continuer vers le paiement · '+montant();
      payer.querySelector('.montant').textContent=montant();
    }
    function info(txt,err){msg.hidden=!txt;msg.textContent=txt||'';msg.classList.toggle('erreur',!!err);}
    function reinit(){
      libelle();
      if(!sess)return;
      try{sess.ex.destroy();sess.pe.destroy();}catch(e){}
      sess=null;zone.hidden=true;btn.hidden=false;btn.disabled=false;btn.classList.remove('en-cours');info('');
    }
    [t,q,l].forEach(function(e){if(e){e.addEventListener('input',reinit);e.addEventListener('change',reinit);}});
    form.elements.email.addEventListener('change',reinit);
    libelle();chargerStripe().catch(function(){});

    function resultat(r){
      if(r&&r.type==='error'){payer.disabled=false;payer.classList.remove('en-cours');info((r.error&&r.error.message)||"Le paiement n'a pas abouti. Vérifiez vos informations ou essayez un autre moyen de paiement.",true);}
    }
    function monter(secret){
      var stripe=window.Stripe(CLE_STRIPE,{locale:'fr'});
      var init=stripe.initCheckoutElementsSdk||stripe.initCheckout;
      var checkout=init.call(stripe,{clientSecret:secret,elementsOptions:{
        fonts:[{family:'Inter',src:'url('+location.origin+'/polices/inter.woff2)',weight:'400'}],
        appearance:{theme:'stripe',variables:{colorPrimary:'#1B2A41',colorBackground:'#FBF9F4',colorText:'#1B2A41',colorDanger:'#9B3B2E',fontFamily:'Inter, system-ui, sans-serif',borderRadius:'4px'}}
      }});
      var ex=checkout.createExpressCheckoutElement({buttonHeight:50,buttonType:{applePay:'buy',googlePay:'buy'},buttonTheme:{applePay:'black',googlePay:'black'}});
      ex.mount('#express');
      ex.on('ready',function(ev){
        var m=ev&&ev.availablePaymentMethods,ok=!!m&&Object.keys(m).some(function(k){return m[k];});
        zone.querySelector('.ou').hidden=!ok;d.getElementById('express').hidden=!ok;
      });
      ex.on('confirm',function(ev){
        checkout.loadActions().then(function(r){if(r.type!=='success')throw r.error||new Error();return r.actions.confirm({expressCheckoutConfirmEvent:ev});})
          .then(resultat,function(e){resultat({type:'error',error:e||{}});});
      });
      var pe=checkout.createPaymentElement({layout:'tabs'});pe.mount('#carte');
      sess={checkout:checkout,ex:ex,pe:pe};
      zone.hidden=false;btn.hidden=true;info('');
      zone.scrollIntoView({behavior:'smooth',block:'start'});
    }
    payer.addEventListener('click',function(){
      if(!sess)return;
      payer.disabled=true;payer.classList.add('en-cours');info('Paiement en cours…');
      sess.checkout.loadActions().then(function(r){if(r.type!=='success')throw r.error||new Error();return r.actions.confirm();})
        .then(resultat,function(e){resultat({type:'error',error:e||{}});});
    });

    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){form.reportValidity();return;}
      var numero='LS-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
      var nb=Math.max(1,Math.min(20,parseInt(q.value,10)||1));
      var ordre={numero:numero,produit:produit,quantite:nb,total:montant(),email:form.elements.email.value,prenom:(form.elements.nom.value||'').split(' ')[0]};
      try{localStorage.setItem('lignee-commande',JSON.stringify(ordre));}catch(er){}
      btn.disabled=true;btn.classList.add('en-cours');info('Préparation du paiement sécurisé…');
      var fd=new FormData(form);
      fd.append('numero',numero);fd.append('access_key',CLE_FORM);
      fd.append('subject','Lignée · '+titre+' '+numero+' · '+montant()+' (paiement en ligne en cours)');
      var envoi=fetch('https://api.web3forms.com/submit',{method:'POST',body:fd,keepalive:true}).then(function(r){return r.json();});
      var corps={p:produit,q:nb,taille:t?t.value:'petit',livraison:l?l.value:'relais',email:ordre.email,numero:numero,
        nom:form.elements.nom.value,tel:form.elements.telephone.value,rappel:!!(form.elements.rappel&&form.elements.rappel.checked),
        message:form.elements.message?form.elements.message.value:''};
      var prep=fetch(API+'/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corps)})
        .then(function(r){return r.json().then(function(j){if(!r.ok||!j.clientSecret)throw new Error(j.erreur||'serveur');return j.clientSecret;});});
      Promise.all([chargerStripe(),prep]).then(function(r){monter(r[1]);}).catch(function(){
        // Repli : la commande part en réservation, Lignée envoie un lien de paiement.
        envoi.then(function(j){
          if(!j||!j.success)throw new Error();
          btn.classList.remove('en-cours');
          info('Merci, votre commande est enregistrée. Le paiement en ligne est momentanément indisponible : nous vous écrivons très vite avec un lien de paiement sécurisé.');
        }).catch(function(){
          btn.disabled=false;btn.classList.remove('en-cours');
          info("L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-nous à contact@maison-lignee.fr.",true);
        });
      });
    });
  }

  /* ---------- Page merci.html ---------- */
  function merci(z){
    var o=null;try{o=JSON.parse(localStorage.getItem('lignee-commande')||'null');}catch(e){}
    function etat(e){[].forEach.call(z.querySelectorAll('[data-etat]'),function(x){x.hidden=x.getAttribute('data-etat')!==e;});}
    if(o){
      z.querySelector('.m-recap').hidden=false;
      z.querySelector('.m-num').textContent=o.numero;
      z.querySelector('.m-obj').textContent=(o.produit==='coussin'?'Coussin souvenir':'Doudou souvenir')+(o.quantite>1?' × '+o.quantite:'');
      z.querySelector('.m-total').textContent=o.total;
      z.querySelector('.m-mail').textContent=o.email;
      if(o.prenom)d.querySelector('.m-prenom').textContent=', '+o.prenom;
      var a=z.querySelector('.m-reessayer');if(a)a.href=(o.produit==='coussin'?'coussin':'doudou')+'.html#commande';
    }
    var sid=new URLSearchParams(location.search).get('session_id');
    if(!sid){etat('verif');return;}
    etat('verif');
    fetch(API+'/session?id='+encodeURIComponent(sid)).then(function(r){return r.json();}).then(function(j){
      if(j.statut==='complete'){etat('paye');}
      else{etat('echec');var h=d.querySelector('h1');if(h)h.innerHTML='Votre commande <em>n’est pas encore payée.</em>';}
    }).catch(function(){etat('verif');});
  }

  style();
  var f=d.querySelector('form[data-paiement]');if(f)commande(f);
  var z=d.getElementById('merci');if(z)merci(z);
})();
