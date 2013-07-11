if (document.location.host.match(/localhost/)) {
  (function(d,t) {
    var g=d.createElement('script'),s=document.getElementsByTagName('script')[0];
    g.src='http://localhost:35729/livereload.js';
    s.parentNode.insertBefore(g,s);
  }(document,'script'));
}