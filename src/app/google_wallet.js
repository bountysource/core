'use strict';
(function(d,t) {
  var g=d.createElement(t),s=document.getElementsByTagName(t)[0];
  g.src = (window.BS_ENV === 'prod' ? 'https://wallet.google.com/inapp/lib/buy.js' : 'https://sandbox.google.com/checkout/inapp/lib/buy.js');
  s.parentNode.insertBefore(g,s);
}(document,'script'));
