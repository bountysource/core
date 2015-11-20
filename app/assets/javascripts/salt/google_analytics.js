/* jshint ignore:start */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
/* jshint ignore:end */

ga('create', window.BS_ENV.google_analytics, 'auto');
ga('require', 'linkid', 'linkid.js');
ga('require', 'ec');

angular.module('app').run(function($rootScope, $location, $api, $window) {
  $rootScope.$on('$viewContentLoaded', function() {
    var user_id = ($rootScope.person||{}).id;
    $window.ga('set', '&uid', user_id ? user_id : null);
    ga('send', 'pageview', '/salt' + $location.url());
  });
});
