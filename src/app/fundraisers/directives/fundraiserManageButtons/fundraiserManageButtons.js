'use strict';

angular.module('fundraisers').directive('fundraiserManageButtons', function($location, $api, $modal) {
  return {
    restrict: 'EAC',
    templateUrl: 'app/fundraisers/directives/fundraiserManageButtons/templates/fundraiserManageButtons.html',
    scope: { fundraiser: '=' },
    link: function(scope) {

      scope.can_manage = false;
      scope.publishable = false;

      scope.$watch('fundraiser', function(fundraiser) {
        if (fundraiser) {
          scope.can_manage = scope.fundraiser.person && scope.current_person && scope.fundraiser.person.id === scope.current_person.id;
          scope.publishable = scope.fundraiser.title && fundraiser.short_description && scope.fundraiser.funding_goal && fundraiser.description;
        }
      });

      // Publish a fundraiser
      scope.publishFundraiser = function(fundraiser) {
        return $api.fundraiser_publish(fundraiser.id, function(response) {
          if (response.meta.success) {
            $location.url("/fundraisers/"+fundraiser.slug);
          } else {
            scope.error = "ERROR: " + response.data.error;
          }
          return response.data;
        });
      };

      scope.showNewUpdateModal = function() {
        var parentScope = scope;

        $modal.open({
          templateUrl: 'app/fundraisers/templates/newUpdateModal.html',
          backdrop: true,
          controller: function($scope, $window, $cookieStore, $api, $modalInstance) {
            $scope.fundraiser = angular.copy(parentScope.fundraiser);

            $scope.cookieName = 'fr' + $scope.fundraiser.id + 'newUpdate';

            $scope.newUpdate = {
              title: ($cookieStore.get($scope.cookieName) || {}).title,
              body: ($cookieStore.get($scope.cookieName) || {}).body
            };

            $scope.close = function() {
              $modalInstance.dismiss();
            };

            $scope.discard = function() {
              if ($window.confirm("Discard update?")) {
                $cookieStore.remove($scope.cookieName);
                $scope.close();
              };
            };

            $scope.publishUpdate = function() {
              if ($window.confirm("Publish update?")) {
                var payload = angular.copy($scope.newUpdate);

                $api.v2.createFundraiserUpdate($scope.fundraiser.id, payload).then(function(response) {
                  if (response.status === 201) {
                    // Append to `fundraiser.updates` if present on parentScope
                    if (parentScope.fundraiser && parentScope.fundraiser.updates) {
                      parentScope.fundraiser.updates.push(angular.copy(response.data));
                    }

                    // Append to `updates` if present on parentScope
                    if (parentScope.updates) {
                      parentScope.updates.push(angular.copy(response.data));
                    }

                    $cookieStore.remove($scope.cookieName);
                    $modalInstance.close();
                  } else {
                    $scope.alert = { type: 'danger', message: response.data.error };
                  }
                });
              }
            };

            $scope.saveUpdateToCookie = function() {
              $cookieStore.put($scope.cookieName, $scope.newUpdate);
            };
          }
        });
      };

    }
  };
});
