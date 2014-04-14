'use strict';

angular.module('factories').factory('AddressManager', function($api, $modal, $window, $rootScope, $log) {
  return function(addresses) {

    this._uniqueId = 'addressManager' + (new Date()).getTime().toString();

    this.addressAddedEvent = [this._uniqueId, 'addressAdded'].join(':');
    this.addressRemovedEvent = [this._uniqueId, 'addressRemoved'].join(':');

    this.addresses = [];
    var self = this;

    if (angular.isArray(addresses)) {
      self.addresses = angular.copy(addresses);

    // If promise, wait for resolution
    } else if (angular.isObject(addresses) && addresses.hasOwnProperty('then')) {
      addresses.then(function(addresses) {
        if (angular.isArray(addresses)) {
          self.addresses = angular.copy(addresses);
        } else {
          $log.warn('Invalid addresses:', addresses);
        }
      });
    }

    this.openCreateModal = function() {
      $modal.open({
        templateUrl: 'common/factories/addressManager/templates/new.html',
        controller: function($scope, $modalInstance, countries, usStates) {
          $scope.countries = countries;
          $scope.usStates = usStates;

          $scope.address = {
            name: undefined,
            address1: undefined,
            address2: undefined,
            address3: undefined,
            city: undefined,
            state: undefined,
            postal_code: undefined,
            country: undefined
          };

          $scope.close = function() {
            $modalInstance.close();
          };

          $scope.createAddress = function() {
            var payload = angular.copy($scope.address);
            $api.v2.createAddress(payload).then(function(response) {
              self.addresses.unshift(angular.copy(response.data));
              $rootScope.$broadcast(self.addressAddedEvent, self.addresses[0]);
              $scope.close();
            });
          };
        }
      });
    };

    this.openManageModal = function() {
      $modal.open({
        templateUrl: 'common/factories/addressManager/templates/manage.html',
        controller: function($scope, $modalInstance, countries, usStates) {

          $scope.addresses = self.addresses;

          $scope.countries = countries;
          $scope.usStates = usStates;

          $scope.new = self.openNewAddressModal;

          $scope.close = function() {
            $modalInstance.close();
          };

          $scope.enableEdit = function(index) {
            self.addresses[index]._changes = angular.copy(self.addresses[index]);
          };

          $scope.cancelEdit = function(index) {
            delete self.addresses[index]._changes;
          };

          $scope.delete = function(index) {
            if ($window.confirm("Are you sure?")) {
              $api.v2.deleteAddress(self.addresses[index].id).then(function() {
                $rootScope.$broadcast(self.addressRemovedEvent, self.addresses[index]);
                self.addresses.splice(index,1);
              });
            }
          };

          $scope.saveChanges = function(index) {
            if (self.addresses[index]) {
              var payload = angular.copy(self.addresses[index]._changes);
              $api.v2.updateAddress(self.addresses[index].id, payload).then(function(response) {
                self.addresses[index] = angular.copy(response.data);
              });
            }
          };
        }
      });
    };

  };
});
