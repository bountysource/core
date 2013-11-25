"use strict";

//load the analytics.js script
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

//sets up analytics account
//for localhost testing add this option hash as the last param: {'cookieDomain': 'none'}
ga('create', document.location.host === 'www.bountysource.com' ? 'UA-36879724-1' : 'UA-36879724-2');

//enhanced link attribution (inpage analytics). See https://support.google.com/analytics/answer/2558867?hl=en
ga('require', 'linkid', 'linkid.js');

angular.module('app').run(function($rootScope, $window, $location) {
  $rootScope.$on('$viewContentLoaded', function() {
    ga("send", "pageview", {"location": $location.url()}); //override google setting location. See https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
  });
});
