"use strict";

angular.module('resources').factory('Tracker', function ($rootScope, $resource) {

  var defaultHeaders = { 'Accept': 'application/vnd.bountysource+json; version=2' };

  var Tracker = $resource($rootScope.api_host + '/trackers/:id', { id: '@id' }, {
    get: { method: 'GET', headers: defaultHeaders },
    query: { method: 'GET', isArray: true, headers: defaultHeaders }
  });

  /*
  * Get URL for the Tracker.
  * Cases:
  * 1. Tracker owned by team. Return URL to the issues tab for the team filtered by this.id
  * 2. Tracker not owned by team. Return URL to the (legacy?) Tracker page.
  * */
  Tracker.prototype.url = function (tracker_ids) {
    if (this.owner && this.owner.type === "Team") {
      var tracker_id_params = tracker_ids.join(",");
      return "/teams/"+this.owner.slug+"/issues?tracker_ids="+tracker_id_params;
    } else {
      return "/trackers/"+this.slug;
    }
  };

  return Tracker;

});
