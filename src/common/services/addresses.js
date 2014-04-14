'use strict';

angular.module('services').service('$addressManager', function($api) {

  var self = this;
  this.addresses = [];

  // Fetch all addresses from API
  this.initialize = function(params) {
    return $api.v2.addresses(params).then(function(response) {
      self.addresses = angular.copy(response.data);
      return response;
    });
  };

  this.add = function(address) {
    this.addresses.unshift(angular.copy(address));
  };

  this.remove = function(index) {
    this.addresses.splice(index,1);
  };

});