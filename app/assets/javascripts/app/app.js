angular.module('constants', []);
angular.module('filters', []);
angular.module('directives', []);
angular.module('services', []);
angular.module('factories', []);
angular.module('resources', []);
angular.module('bountysource', ['constants', 'services', 'directives', 'filters', 'factories', 'resources']);

angular.module('activity', ['bountysource']);
angular.module('fundraisers', ['bountysource']);
angular.module('teams', ['bountysource']);

angular.module('app', [
  'ngRoute',
  'ngSanitize',
  'ngCookieJar',
  'ngResource',
  'ui.bootstrap',
  'ui.inflector',
  'colorpicker.module',
  'activity',
  'fundraisers',
  'teams',
  'ui.scrollfix',
  'templates',
  'btford.markdown',
  'monospaced.elastic'
]);

angular.module('app')
  .config(function ($locationProvider, $httpProvider, $provide, featureProvider) {

    // Register the RFP feature for feature locking.
    featureProvider.register('rfp', false);

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

      // close widget if open
      $rootScope.$emit('bancorWidgetClose');
    });
  })

  .run(function($rootScope, $window, $api, feature) {

    /**
     * Expose feature service to window to easily enable/disable features on the fly.
     * Also expose on $rootScope for easy usage in views
     */
    $window.feature = feature;
    $rootScope.featureEnabled = feature.enabled;
    $rootScope.featureDisabled = feature.disabled;

      // load person from initial cookies
    $api.load_current_person_from_cookies();
    // Scroll to top on route change... for some reason this isn't happening automatically.
    // Something else may be causing this issue, but this works for now
    $rootScope.$on('$routeChangeSuccess', function() {
      $window.scrollTo(0,0);
    });
  });
