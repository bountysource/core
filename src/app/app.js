'use strict';

if (document.location.host === 'www.bountysource.com') {
  window.BS_CONFIG = {
    environment: 'production',
    api_host: 'https://api.bountysource.com/',
    mixpanel: 'f9b55dbcc390114a4ed685391a7563e0',
    google_analytics: 'UA-36879724-1',
    google_wallet_url: 'https://wallet.google.com/inapp/lib/buy.js'
  };
} else if (document.location.host === 'staging.bountysource.com') {
  window.BS_CONFIG = {
    environment: 'staging',
    api_host: 'https://staging-api.bountysource.com/',
    mixpanel: 'd385359c475583c9a8315cf0c2e0b197',
    google_analytics: 'UA-36879724-2',
    google_wallet_url: 'https://sandbox.google.com/checkout/inapp/lib/buy.js'
  };
} else {
  window.BS_CONFIG = {
    environment: 'development',
    mixpanel: 'b48006f9db0a9702dad8c366eae96e40',
    api_host: '',
    google_analytics: 'UA-36879724-2',
    google_wallet_url: 'https://sandbox.google.com/checkout/inapp/lib/buy.js'
  };
}

angular.module('constants', []);
angular.module('filters', []);
angular.module('directives', []);
angular.module('services', []);
angular.module('factories', []);
angular.module('bountysource', ['constants', 'services', 'directives', 'filters', 'factories']);

angular.module('activity', ['bountysource']);
angular.module('fundraisers', ['bountysource']);
angular.module('teams', ['bountysource']);

angular.module('app', [
  'ngRoute',
  'ngSanitize',
  'ngCookies',
  'ui.bootstrap',
  'colorpicker.module',
  'activity',
  'fundraisers',
  'teams',
  'ui.scrollfix'
]);

angular.module('app')
  .config(function ($locationProvider, $httpProvider, $provide) {
    //  NOTE: uncomment to test_old hashbang # mode
    //  $provide.decorator('$sniffer', function($delegate) { $delegate.history = false; return $delegate; });

    // html5mode should handle old '#' style routes
    $locationProvider.html5Mode(true);

    // CORS support
    $provide.decorator('$sniffer', function($delegate) { $delegate.cors = true; return $delegate; });
    // HACK: angular 1.0 adds this bad header... not needed in 1.1 per https://github.com/angular/angular.js/pull/1454
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })

  .controller('AppController', function ($scope, $location, $rootScope, $window, $pageTitle) {
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

  .run(function($rootScope, $anchorScroll, $api, $window) {
    // load person from initial cookies
    $api.load_current_person_from_cookies();
    // Scroll to top on route change... for some reason this isn't happening automatically.
    // Something else may be causing this issue, but this works for now
    var routeListener = $rootScope.$on('$routeChangeSuccess', function() {
      $window.scrollTo(0,0);
      routeListener();
    });
  });
