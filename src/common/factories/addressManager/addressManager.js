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

    // Create address.
    // Returns promise of self
    this.create = function(payload) {
      var payload = angular.copy(payload);
      return $api.v2.createAddress(payload).then(function(response) {
        self.addresses.unshift(angular.copy(response.data));
        $rootScope.$broadcast(self.addressAddedEvent, self.addresses[0]);

        return response;
      });
    };

    // Update address at index
    // Returns promise of self
    this.update = function(index) {
      return $api.v2.updateAddress(self.addresses[index].id, payload).then(function(response) {
        self.addresses[index] = angular.copy(response.data);

        return response;
      });
    };

    // Remove address at index
    // Returns promise of self
    this.delete = function(index) {
      return $api.v2.deleteAddress(self.addresses[index].id).then(function(response) {
        $rootScope.$broadcast(self.addressRemovedEvent, self.addresses[index]);
        self.addresses.splice(index,1);

        return response;
      });
    };

  };
});
