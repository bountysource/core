angular.module('app').controller('PeopleShow', function ($scope, $routeParams, $api, $pageTitle, $location, Timeline) {
  if ((/^18483-/).test($routeParams.id)) {
    $location.url("/teams/bountysource").replace();
  }

  $api.person_get($routeParams.id).then(function(person) {
    $pageTitle.set(person.display_name, 'Profile');

    person.display_name = person.display_name.replace(/\(unknown\)/g, '').trim();

    $scope.person = person;
    return person;
  });

  $scope.events = Timeline.query({ per_page: 30, person_id: $routeParams.id });

  $api.person_teams($routeParams.id).then(function(teams) {
    $scope.teams = teams;
    return teams;
  });

  $scope.report = {
    open: false,
    submitting: false,
    submitted: false,
    error: null,
    form: {
      reason: 'spam',
      comment: ''
    }
  };

  $scope.toggleReportForm = function() {
    $scope.report.open = !$scope.report.open;
    $scope.report.error = null;
    $scope.report.submitted = false;
  };

  $scope.submitReport = function() {
    $scope.report.submitting = true;
    $scope.report.error = null;

    $api.person_report($routeParams.id, $scope.report.form).then(function(response) {
      $scope.report.submitting = false;

      if (response.meta && response.meta.success) {
        $scope.report.submitted = true;
        $scope.report.open = false;
        $scope.report.form.comment = '';
      } else {
        $scope.report.error = response.data && response.data.error || 'Unable to submit report.';
      }
    });
  };
});
