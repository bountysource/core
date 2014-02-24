'use strict';

if (document.location.host === 'www.bountysource.com') {
  window.BS_ENV = 'prod';
} else {
  window.BS_ENV = 'staging';
}

angular.module('constants', []);
angular.module('filters', []);
angular.module('directives', []);
angular.module('services', []);
angular.module('bountysource', ['constants', 'services', 'directives', 'filters']);

angular.module('fundraisers', ['bountysource']);

angular.module('app', [
  'ngRoute',
  'ngSanitize',
  'ngCookies',
  'ui.bootstrap',
  'colorpicker.module',
  'fundraisers'
]);

angular.module('app')
  .config(function ($locationProvider, $httpProvider, $provide) {
    //  NOTE: uncomment to test_old hashbang # mode
    //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

    $locationProvider.html5Mode(true);

    // HACK: transform old-style #urls into new style #/urls
    if ((window.location.hash||'').match(/^#[^/]/)) {
      window.location.hash = '#/' + window.location.hash.replace(/^#/,'');
    }

    // CORS support
    $provide.decorator('$sniffer', function($delegate) { $delegate.cors = true; return $delegate; });
    // HACK: angular 1.0 adds this bad header... not needed in 1.1 per https://github.com/angular/angular.js/pull/1454
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })

  .controller('AppController', function ($scope, $location, $rootScope, $window, $pageTitle) {
    $rootScope.$on('$viewContentLoaded', function() {
      $scope.no_container = $location.path() === '/';
    });

    // change page title on change route
    $rootScope.$on('$routeChangeStart', function (event, current) {
      if (!current.$$route) {
        $pageTitle.set('Page Not Found');
      } else if (current.$$route.title) {
        $pageTitle.set(current.$$route.title);
      } else {
        $pageTitle.set();
      }
    });

    // initialize zendesk feedback button if not mobile
    if ($window.innerWidth > 979) {
      if (typeof(Zenbox) !== "undefined") {
        $window.Zenbox.init({
          dropboxID:   "20109324",
          url:         "https://bountysource.zendesk.com",
          tabTooltip:  "Feedback",
          tabImageURL: "https://images.zendesk.com/external/zenbox/images/tab_feedback.png",
          tabColor:    "#129e5e",
          tabPosition: "Left"
        });
      }
    }
  })

  .run(function($api) {
    // load person from initial cookies
    $api.load_current_person_from_cookies();
  });
