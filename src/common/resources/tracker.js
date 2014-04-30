"use strict";

angular.module('resources').factory('Tracker', function ($rootScope, $resource) {
  // define the Tracker resource
  var tracker = $resource($rootScope.api_host + '/trackers/:id', null, {
    query: {
      method: 'GET',
      isArray: true,
      headers: { 'Accept': 'application/vnd.bountysource+json; version=2' },
    }
  });

  // define the tracker module that contains model logic/functions for the Tracker class
  var trackerModule = {
    url: function (tracker_ids) {
      if (this.owner && this.owner.type === "Team") {
        var tracker_id_params = tracker_ids.join(",");
        return "/teams/"+this.owner.slug+"/issues?tracker_ids="+tracker_id_params;
      } else {
        return "/trackers/"+this.slug;
      }
    }
  };

  // extend the Tracker resource with the tracker module
  angular.extend(tracker.prototype, trackerModule);
  return tracker;
});
