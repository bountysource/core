'use strict';

angular.module('app').controller('HomeSearchController', function ($scope, $state, $api) {
  $scope.search_typeahead = {
    query: null,

    // submit_search: function() {
    //   if ($scope.search_typeahead.query && $scope.search_typeahead.query.length > 0) {
    //     $location.path("/search").search({ query: $scope.search_typeahead.query });
    //   }
    // },

    update_results: function(search_text) {
      return $api.tags.typeahead({ search: search_text, disclude_tags: true, accepts_public_payins: true }).$promise;
    },

    selected: function(item) {
      if (item.type === 'Team') {
        $state.transitionTo('root.teams.show', item);
        $scope.search_typeahead.query = null;
      }
    }
  };
});
