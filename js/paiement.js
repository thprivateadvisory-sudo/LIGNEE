/* Lignée · achat en un geste (doudou.html, coussin.html) et page merci.html.
   Le paiement est préparé dès l'arrivée sur la page : Apple Pay / Google Pay en un geste,
   ou e-mail + carte. Le serveur api/worker.js recalcule le prix : ce fichier ne fait qu'afficher.
   Si le serveur ne répond pas, le client laisse son e-mail et Lignée lui envoie un lien de paiement. */
(function(){
  'use strict';
  var API='https://lignee-paiement.muddy-fog-dddb.workers.dev';
  var CLE_STRIPE='pk_live_51TOybqRmrarRZT7ezNz8gy54YSqyGtY5gY4g6RvyBxl7JWYAbFNFMadiSR7C1pKUnVnwDMRn8LrX3Ds0JeNlE5g400ndJUulYO';
  var CLE_FORM='264f0919-dc05-41b5-aeb6-cbdd337fcb32'; // Web3Forms : avis de commande à Lignée
  var d=document;
  function eur(n){return n+' €';}
  function chargerStripe(){
    return new Promise(function(ok,ko){
      if(window.Stripe)return ok();
      var sc=d.querySelector('script[data-stripe]');
      if(!sc){sc=d.createElement('script');sc.src='https://js.stripe.com/endive/stripe.js';sc.setAttribute('data-stripe','');d.head.appendChild(sc);}
      sc.addEventListener('load',function(){ok();});sc.addEventListener('error',ko);
      setTimeout(function(){if(window.Stripe)ok();else ko(new Error('stripe'));},12000);
    });
  }
  function aviser(champs){
    var fd=new FormData();fd.append('access_key',CLE_FORM);
    Object.keys(champs).forEach(function(k){fd.append(k,champs[k]);});
    return fetch('https://api.web3forms.com/submit',{method:'POST',body:fd,keepalive:true}).then(function(r){return r.json();});
  }

  /* ---------- Achat ---------- */
  function achat(form){
    var produit=form.getAttribute('data-paiement'),unite=form.getAttribute('data-unite');
    var p1=+form.getAttribute('data-p1'),ps=+form.getAttribute('data-ps');
    var msg=form.querySelector('.form-msg'),payer=form.querySelector('.payer'),mail=form.elements.email;
    var qv=form.querySelector('.q-val'),moins=form.querySelector('.q-moins'),plus=form.querySelector('.q-plus');
    var q=1,stripe=null,sess=null,jeton=0,minuteur=null,horsLigne=false;

    function val(n){var x=form.querySelector('input[name='+n+']:checked');return x?x.value:'';}
    function calcul(){
      var g=val('taille')==='grand'?10:0,dom=val('livraison')==='domicile';
      var a=p1+g,b=ps+g,t=a+(q-1)*b+(dom?5:0);
      var det=q===1?'1 '+unite+' · '+eur(a):'1 × '+eur(a)+' + '+(q-1)+' × '+eur(b);
      if(dom)det+=' · retour à domicile +5 €';
      return {total:t,detail:det};
    }
    function afficher(){
      var c=calcul();
      [].forEach.call(d.querySelectorAll('.a-total'),function(x){x.textContent=eur(c.total);});
      form.querySelector('.achat-detail').textContent=c.detail;
      qv.textContent=q;moins.disabled=q<=1;plus.disabled=q>=20;
    }
    function info(t,err){msg.hidden=!t;msg.textContent=t||'';msg.classList.toggle('erreur',!!err);}
    function numero(){return 'LS-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();}
    function memoriser(email){
      var c=calcul();
      try{localStorage.setItem('lignee-commande',JSON.stringify({numero:sess&&sess.numero,produit:produit,quantite:q,total:eur(c.total),detail:c.detail,email:email||''}));}catch(e){}
    }
    function resultat(r){
      if(r&&r.type==='error'){payer.disabled=false;payer.classList.remove('en-cours');info((r.error&&r.error.message)||"Le paiement n'a pas abouti. Vérifiez vos informations ou essayez un autre moyen de paiement.",true);}
    }
    function detruire(){
      if(!sess)return;
      try{sess.ex.destroy();}catch(e){}try{sess.pe.destroy();}catch(e){}
      sess=null;
    }
    // Prépare (ou re-prépare après un changement d'option) le paiement.
    function preparer(){
      var mon=++jeton,num=numero();
      detruire();
      d.getElementById('carte').innerHTML='<p class="chargement">Chargement du paiement sécurisé…</p>';
      d.getElementById('express').innerHTML='';
      var corps={p:produit,q:q,taille:val('taille')||'petit',livraison:val('livraison')||'relais',numero:num};
      Promise.all([chargerStripe(),fetch(API+'/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corps)})
        .then(function(r){return r.json().then(function(j){if(!r.ok||!j.clientSecret)throw new Error(j.erreur||'serveur');return j.clientSecret;});})])
      .then(function(r){
        if(mon!==jeton)return;
        stripe=stripe||window.Stripe(CLE_STRIPE,{locale:'fr'});
        var init=stripe.initCheckoutElementsSdk||stripe.initCheckout;
        var checkout=init.call(stripe,{clientSecret:r[1],elementsOptions:{
          fonts:[{family:'Inter',src:'url('+location.origin+'/polices/inter.woff2)',weight:'400'}],
          appearance:{theme:'stripe',variables:{colorPrimary:'#1B2A41',colorBackground:'#F5F1E8',colorText:'#1B2A41',colorDanger:'#9B3B2E',fontFamily:'Inter, system-ui, sans-serif',borderRadius:'4px'}}
        }});
        d.getElementById('carte').innerHTML='';
        var ex=checkout.createExpressCheckoutElement({buttonHeight:52,buttonType:{applePay:'buy',googlePay:'buy'},buttonTheme:{applePay:'black',googlePay:'black'}});
        ex.mount('#express');
        ex.on('ready',function(ev){
          var m=ev&&ev.availablePaymentMethods,ok=!!m&&Object.keys(m).some(function(k){return m[k];});
          form.querySelector('.ou').hidden=!ok;d.getElementById('express').hidden=!ok;
        });
        ex.on('confirm',function(ev){
          memoriser('');
          checkout.loadActions().then(function(a){if(a.type!=='success')throw a.error||new Error();return a.actions.confirm({expressCheckoutConfirmEvent:ev});})
            .then(resultat,function(e){resultat({type:'error',error:e||{}});});
        });
        var pe=checkout.createPaymentElement({layout:'tabs'});pe.mount('#carte');
        sess={checkout:checkout,ex:ex,pe:pe,numero:num};
      })
      .catch(function(){
        if(mon!==jeton)return;
        // Repli : paiement en ligne indisponible.
        horsLigne=true;
        d.getElementById('carte').innerHTML='<p class="chargement">Le paiement en ligne est momentanément indisponible. Laissez votre e-mail&nbsp;: nous vous envoyons votre lien de paiement dans l’heure.</p>';
        form.querySelector('.ou').hidden=true;
        payer.textContent='Recevoir mon lien de paiement';
      });
    }
    function changement(){afficher();info('');clearTimeout(minuteur);minuteur=setTimeout(preparer,450);}
    [].forEach.call(form.querySelectorAll('input[type=radio]'),function(x){x.addEventListener('change',changement);});
    moins.addEventListener('click',function(){if(q>1){q--;changement();}});
    plus.addEventListener('click',function(){if(q<20){q++;changement();}});

    form.addEventListener('submit',function(e){
      e.preventDefault();
      var email=(mail.value||'').trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){info('Indiquez votre e-mail pour recevoir la confirmation.',true);mail.focus();return;}
      var c=calcul();
      if(horsLigne){
        payer.disabled=true;
        aviser({subject:'Lignée · Commande '+unite+' à finaliser · '+eur(c.total),objet:produit,quantite:q,taille:val('taille'),livraison:val('livraison'),total:eur(c.total),email:email})
          .then(function(j){if(!j.success)throw new Error();info('Merci. Nous vous envoyons votre lien de paiement dans l’heure (jours ouvrés).');})
          .catch(function(){payer.disabled=false;info("L'envoi n'a pas abouti. Écrivez-nous à contact@maison-lignee.fr.",true);});
        return;
      }
      if(!sess){info('Le paiement se prépare, un instant…');return;}
      payer.disabled=true;payer.classList.add('en-cours');info('Paiement en cours…');
      memoriser(email);
      sess.checkout.loadActions().then(function(a){if(a.type!=='success')throw a.error||new Error();return a.actions.confirm({email:email});})
        .then(resultat,function(er){resultat({type:'error',error:er||{}});});
    });

    // Barre « Commander » sur mobile : masquée quand le bloc d'achat est visible.
    var barre=d.querySelector('.barre-achat');
    if(barre&&'IntersectionObserver' in window){
      new IntersectionObserver(function(es){barre.classList.toggle('cache',es[0].isIntersecting);},{threshold:.15}).observe(form);
    }
    afficher();preparer();
  }

  /* ---------- Page merci.html ---------- */
  function merci(z){
    var o=null;try{o=JSON.parse(localStorage.getItem('lignee-commande')||'null');}catch(e){}
    function etat(e){[].forEach.call(z.querySelectorAll('[data-etat]'),function(x){x.hidden=x.getAttribute('data-etat')!==e;});}
    function recap(email){
      if(!o)return;
      z.querySelector('.m-recap').hidden=false;
      z.querySelector('.m-num').textContent=o.numero||'';
      z.querySelector('.m-obj').textContent=(o.produit==='coussin'?'Coussin souvenir':'Doudou souvenir')+(o.quantite>1?' × '+o.quantite:'');
      z.querySelector('.m-total').textContent=o.total;
      z.querySelector('.m-mail').textContent=email||o.email||'';
      var a=z.querySelector('.m-reessayer');if(a)a.href=(o.produit==='coussin'?'coussin':'doudou')+'.html#commande';
    }
    recap();
    var sid=new URLSearchParams(location.search).get('session_id');
    etat('verif');
    if(!sid)return;
    fetch(API+'/session?id='+encodeURIComponent(sid)).then(function(r){return r.json();}).then(function(j){
      if(j.statut==='complete'){
        etat('paye');recap(j.email);
        if(j.nom)d.querySelector('.m-prenom').textContent=', '+String(j.nom).split(' ')[0];
        // Avis de commande à Lignée, une seule fois par paiement.
        var cle='lignee-avis-'+sid,deja=false;try{deja=!!localStorage.getItem(cle);localStorage.setItem(cle,'1');}catch(e){}
        if(!deja)aviser({subject:'Lignée · Commande payée '+(j.numero||'')+' · '+(j.total/100)+' €',numero:j.numero||'',objet:j.objet||'',quantite:j.quantite||'',taille:j.taille||'',livraison:j.livraison||'',total:(j.total/100)+' €',nom:j.nom||'',email:j.email||''}).catch(function(){});
      }else{etat('echec');var h=d.querySelector('h1');if(h)h.innerHTML='Votre commande <em>n’est pas encore payée.</em>';}
    }).catch(function(){etat('verif');});
  }

  var f=d.querySelector('form[data-paiement]');if(f)achat(f);
  var z=d.getElementById('merci');if(z)merci(z);
})();
