(function(d,t) {
  var g=d.createElement('script'),s=document.getElementsByTagName('script')[0];
  if (document.location.host.match(/www\.bountysource\.com/)) {
    g.src='https://wallet.google.com/inapp/lib/buy.js';
  } else {
    g.src='https://sandbox.google.com/checkout/inapp/lib/buy.js';
  }
  s.parentNode.insertBefore(g,s);
}(document,'script'));
