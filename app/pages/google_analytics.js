'use strict';

window._gaq = window._gaq || [];
window._gaq.push(['_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js']);
window._gaq.push(['_setAccount', document.location.host === 'www.bountysource.com' ? 'UA-36879724-1' : 'UA-36879724-2']);
(function(d,t){
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=('https:'===location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
  s.parentNode.insertBefore(g,s);
}(document,'script'));

angular.module('app').run(function($rootScope, $window, $location) {
  console.log("firing google analytics pixel");
  $rootScope.$on('$viewContentLoaded', function() {
    console.log("really firing google analytics pixel");
    $window._gaq.push(['_trackPageview', $location.url()]);
  });
});