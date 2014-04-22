'use strict';

angular.module('services').service('$currency', function ($cookieStore, $window, $log, $api, $analytics) {

  var self = this;

  this._currencies = ['USD', 'BTC'];
  this._cookieName = 'currencySwitcherValue';

  // Get BTC price
  this.btcToUsdRate = undefined;
  $api.v2.currencies().then(function(response) {
    if (response.success) {
      self.btcToUsdRate = response.data.bitcoin;
    } else {
      $log.error('Failed to get currency values');
    }
  });

  this.setCurrency = function(value) {
    if (this._currencies.indexOf(value) >= 0) {
      // Iff value actually changed
      if (value !== this.value) {
        this.value = value;
        this.writeValueToCookie();

        $analytics.changeCurrency(this.value);
        $log.info('Currency changed to', this.value);
      }
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

  // Load value from cookies, or set to USD
  this.value = this.getValueFromCookie() || 'USD';

});
