'use strict';

angular.module('app').
  directive('ngFocus', ['$parse', function($parse) {
    return function(scope, element, attr) {
      var fn = $parse(attr.ngFocus);
      element.bind('focus', function(event) {
        scope.$apply(function() {
          fn(scope, {$event:event});
        });
      });
    };
  }]).
  directive('ngBlur', ['$parse', function($parse) {
    return function(scope, element, attr) {
      var fn = $parse(attr.ngBlur);
      element.bind('blur', function(event) {
        scope.$apply(function() {
          fn(scope, {$event:event});
        });
      });
    };
  }]).
  directive('ngClickRequireAuth', ['$parse', '$api', function($parse, $api) {
    return {
      restrict: "A",
      link: function(scope, element, attr) {
        var action = $parse(attr.ngClickRequireAuth);
        element.bind('click', function(event) {
          scope.$apply(function() {
            if (scope.current_person) {
              action(scope, {$event: event});
            } else {
              // if it has an href attribute, save that as the postauth URL
              var url = element.attr('href');
              element.removeAttr('href');
              element.removeAttr('ng-href'); // don't know if this actually has to be removed. oh well.
              $api.require_signin(url);
            }
          })
        });
      }
    };
  }]).
  directive('requireTwitter', ['$twttr', function($twttr) {
    return {
      restrict: "A",
      scope: "isolate",
      link: function() { $twttr.widgets.load(); }
    };
  }]).
  directive('requireGplus', ['$gplus', function($gplus) {
    return {
      restrict: "A",
      scope: "isolate",
      link: function() { $gplus.plusone.go(); } // $gplus.widgets.load();
    };
  }]).
  directive('selectOnClick', function () {
    return {
      restrict: "A",
      link: function (scope, element, attr) {
        element.bind('click', function() {
          element[0].select();
        });
      }
    }
  }).
  directive('fundraiserCard', function() {
    return {
      restrict: "E",
      scope: {
        fundraiser: "="
      },
      templateUrl: "pages/fundraisers/partials/homepage_card.html"
    };
  }).
  directive('projectCard', function() {
    return {
      restrict: "E",
      scope: {
        project: "="
      },
      templateUrl: "pages/trackers/partials/homepage_card.html"
    };
  });