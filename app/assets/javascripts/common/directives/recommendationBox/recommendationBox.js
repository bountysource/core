angular.module('directives').directive('recommendationBox', function ($api, $location, Recommendation) {
  return {
    restrict: "E",
    templateUrl: "common/directives/recommendationBox/recommendationBox.html",
    replace: true,
    link: function (scope, element, attrs) {

      var recbox = scope.recbox = {
        load: function() {
          if (scope.current_person) {
            recbox.refresh();
          }
        },

        refresh: function() {
          recbox.last_refresh = new Date();
          Recommendation.query({
            location: 'homepage' // not used yet
          }, function(results) {
            recbox.recommendations = results;
            recbox.show_next();
          });
        },

        refresh_if_necessary: function() {
          if (recbox.last_refresh && (((new Date()) - recbox.last_refresh) > 60*1000)) {
            recbox.refresh();
          }
        },

        skip: function() {
          recbox.record('skip');
          recbox.show_next();
        },

        show_next: function() {
          if (!scope.recommendation || !angular.equals(scope.recommendation, recbox.recommendations[0])) {
            scope.recommendation = recbox.recommendations.shift();
            if (scope.recommendation) {
              recbox.record('show');
            }
          }
          scope.next_recommendation = recbox.recommendations[0];
        },

        record: function(event) {
          Recommendation.create({
            event: event,
            recommendation: scope.recommendation
          });
        },

        add_bounty_to_cart: function(amount) {
          recbox.record('add_to_cart:' + amount);
        }
      };

      scope.$watch('current_person', recbox.load);
      scope.$on('$viewContentLoaded', recbox.refresh_if_necessary);
    }
  };
});
