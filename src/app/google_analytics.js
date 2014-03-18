'use strict';

window._gaq = window._gaq || [];
window._gaq.push(['_require', 'inpage_linkid', '//www.google-analytics.com/plugins/ga/inpage_linkid.js']);
window._gaq.push(['_setAccount', window.BS_CONFIG.google_analytics]);
(function(d,t){
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=('https:'===location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
  s.parentNode.insertBefore(g,s);
}(document,'script'));

angular.module('app').run(function($rootScope, $window, $location) {
  $rootScope.$on('$viewContentLoaded', function() {
    $window._gaq.push(['_trackPageview', $location.url()]);
  });
});