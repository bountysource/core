'use strict';

angular.module('factories').factory('Tracker', function () {

  return function(tracker) {
    // define a module object with functions to extend the original tracker object
    var tracker_module = {
      url: function (tracker_ids) {
        if (this.owner && this.owner.type === "Team") {
          var tracker_id_params = tracker_ids.join(",");
          return "/teams/"+this.owner.slug+"/issues?tracker_ids="+tracker_id_params;
        } else {
          return "/trackers/"+this.slug;
        }
      }
    };
    return angular.extend(tracker, tracker_module);
  };

});
