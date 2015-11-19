'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.teams.updates.index', {
    url: "/teams/{slug}/updates",
    resolve: {
      updates_redirect: function($state, $stateParams, updates) {
        $state.transitionTo('root.teams.updates.show', { slug: $stateParams.slug, number: updates[0].slug });
      }
    }
  });
});
