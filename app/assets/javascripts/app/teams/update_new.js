angular.module('fundraisers').controller('TeamUpdateNewController', function ($scope, $routeParams, $location, $api, $timeout) {

  $scope.form_data = {};

  ($scope.update_preview = function() {
    $scope.markdown_preview = ($scope.form_data.body||'');
  })();
  $scope.$watch('form_data.body', function() {
    if ($scope.preview_promise) {
      $timeout.cancel($scope.preview_promise);
    }
    $scope.preview_promise = $timeout($scope.update_preview, 500);
  });


  $scope.submit_form = function() {
    $scope.error = null;
    $scope.saving_form = true;
    $api.v2.createTeamUpdate($scope.team.slug, angular.extend({}, $scope.form_data, { mailing_lists: 'bountysource', publish: true })).then(function(response) {
      $scope.saving_form = false;
      if (response.success) {
        $location.url('/teams/' + $routeParams.id + '/updates/' + response.data.slug);
      } else {
        $scope.error = response.data.error;
      }
    });
  };

});
