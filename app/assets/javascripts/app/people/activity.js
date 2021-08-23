angular.module('app').controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle, $location, Timeline) {
  if ((/^18483-/).test($routeParams.id)) {
    $location.url("/teams/bountysource").replace();
  }

  // shortcut
  var person_id = $routeParams.id;

  $api.person_get($routeParams.id).then(function(person) {
    $pageTitle.set(person.display_name, 'Profile');

    person.display_name = person.display_name.replace(/\(unknown\)/g, '').trim();

    $scope.person = person;
    return person;
  });

  $scope.events = Timeline.query({ per_page: 30, person_id: person_id });

  $api.person_teams($routeParams.id).then(function(teams) {
    $scope.teams = teams;
    return teams;
  });

  var report_user_form = $scope.report_user_form = {

    state: "hidden",

    // where all the form data is stored
    data: {},

    // report reasons
    reasons: ['spam', 'abuse', 'fraud', 'other'],

    // if not logged in, send to login, else show form
    show: function() {
      if ($scope.current_person) {
        report_user_form.previous_data = angular.copy(report_user_form.data);
        report_user_form.state = "shown";
      } else {
        $api.set_post_auth_url($location.url());
        $location.url("/signin");
      }
    },

    // disappear the form
    hide: function() {
      report_user_form.state = "hidden";
    },

    // disappear the form and restore previous data
    cancel: function() {
      report_user_form.data = report_user_form.previous_data;
      report_user_form.error = null;
      report_user_form.hide();
    },

    // submit report
    submit: function() {
      report_user_form.error = null;
      var data = { person_id: person_id, reason: report_user_form.data.report_reason, note: report_user_form.data.note};
      $api.person_report(person_id, data).then(report_user_form.report_callback);
    },

    report_callback: function(response) {
      if (response && response.error) {
        report_user_form.error = response.error;
      } else {
        report_user_form.state = "submitted";
      }
    },

  };

  $scope.selectReportReason = function(reason){
    $scope.report_user_form.data.report_reason = reason;
  };

  $scope.report_user_form.data = {};
  $scope.report_user_form.data.report_reason = report_user_form.reasons[0];

});
