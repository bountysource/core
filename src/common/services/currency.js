'use strict';

angular.module('services').service('$currency', function ($cookieStore, $window, $log, $api) {

  this._currencies = ['USD', 'BTC'];
  this._cookieName = 'currencySwitcherValue';
  this.btcToUsdRate = undefined;

  this.value = undefined;

  var self = this;

  this.setCurrency = function(value) {
    if (this._currencies.indexOf(value) >= 0) {
      this.value = value;
      this.writeValueToCookie();
      $log.info('Currency changed to', this.value);
    }
  };

  this.writeValueToCookie = function () {
    return $cookieStore.put(this._cookieName, this.value);
  };

  this.getValueFromCookie = function() {
    return $cookieStore.get(this._cookieName);
  };

  this.usdToBtc = function (value) {
    return value / this.btcToUsdRate;
  };

  this.btcToUsd = function (value) {
    return value * this.btcToUsdRate;
  };

  this.initialize = function () {
    // Load value from cookies, or set to USD
    this.setCurrency(this.getValueFromCookie() || 'USD');

    $api.v2.currencies().then(function(response) {
      if (response.success) {
        self.btcToUsdRate = response.data.bitcoin;
      } else {
        $log.error('Failed to get currency values');
      }
    });
  };

  this.isUSD = function () {
    return this.value === 'USD';
  };

  this.isBTC = function () {
    return this.value === 'BTC';
  };

  this.setUSD = function () {
    return this.setCurrency('USD');
  };

  this.setBTC = function () {
    return this.setCurrency('BTC');
  };


});
