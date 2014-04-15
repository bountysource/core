'use strict';

/*
  /// Purpose ///
  Creates rows of thumbnail links from an array of objects
  that have image_urls.

  /// Requirements ///
  Objects require these attributes for proper rendering:
  1. item.frontend_path
  2. item.name
  3. item.image_url

  /// Arguments ///
  array       => An array of objects that have image_url attributes.
  per-row     => Number of thumbnail links per row.
  object-type => Specifies the object type ('team', 'tracker', 'team-project', 'team-fundraiser-create') to enable conditional rendering logic
                 for hrefs, display_names, etc.
*/

angular.module('directives').directive('thumbnailLinks', function ($analytics, $location) {
  return {
    restrict: 'EA',
    templateUrl: 'common/directives/thumbnailLinks/templates/thumbnailLinks.html',
    scope: {
      array: '=',
      perRow: '=',
      objectType: '=',
      dismissAction: '&'
    },
    replace: true,
    link: function (scope) {
      scope.$watch('array', function (array) {
        // guard clause to prevent calls to empty array
        if(array === undefined) {return;}

        //defaults
        scope.perRow = scope.perRow || 6;
        scope.objectType = scope.objectType || 'tracker';

        scope.range = function() {
          var range = [];
          for(var i = 0; i < scope.array.length; i = i + scope.perRow) {
            range.push(i);
          }
          return range;
        };
      });

      scope.teamRedirect = function (team) {
        // mixpanel track event
        $analytics.startFundraiserDraft(team.id, { type: "existing_team"});

        // take browser to correct location
        $location.path("/teams/"+team.slug+"/fundraisers/new");
      };

    }

  };
});
