angular.module("app").controller('IssueThumbsController', function ($scope, Issue) {
  $scope.issues = Issue.query({ thumbed_by_person_id: $scope.current_person.id, order: 'thumbed_at', include_team: true, include_tracker: true });
});
