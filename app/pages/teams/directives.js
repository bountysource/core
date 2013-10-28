'use strict';

angular.module('app').
  directive('teamTrackerThumbnails', function() {
    return {
      restrict: "E",
      template: '<ul class="thumbnails team-tracker-thumbnails"><li ng-repeat="tracker in trackers" class="span2"><a class="thumbnail text-center" ng-href="/trackers/{{tracker.slug}}"><img ng-src="{{tracker.medium_image_url}}"/><span>{{tracker.name}}</span></a></li></ul>',
      scope: {
        trackers: "="
      }
    };
  });