'use strict';

angular.module('services').service('$currency', function ($rootScope, $cookieStore, $window, $log, $api, $analytics) {

  var self = this;

  this._currencies = ['USD', 'BTC', 'MSC', 'XRP'];
  this._cookieName = 'currencySwitcherValue';

  this.currencyChangedEventName = 'currencyChangedEvent';

  // Get BTC price
  this.btcToUsdRate = undefined;
  this.mscToUsdRate = undefined;
  this.xrpToUsdRate = undefined;
  $api.v2.currencies().then(function(response) {
    if (response.success) {
      self.btcToUsdRate = response.data.bitcoin;
      self.mscToUsdRate = response.data.mastercoin;
      self.xrpToUsdRate = response.data.ripple;
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

        // Fire event down from the heavens
        $rootScope.$broadcast(this.currencyChangedEventName, this.value);

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

  this.usdToXrp = function (value) {
    return value / this.xrpToUsdRate;
  };

  this.xrpToUsd = function (value) {
    return value * this.xrpToUsdRate;
  };

  this.usdToMsc = function (value) {
    return value / this.mscToUsdRate;
  };

  this.mscToUsd = function (value) {
    return value * this.mscToUsdRate;
  };

  this.isUSD = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'USD';
  };

  this.isBTC = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'BTC';
  };

  this.isXRP = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'XRP';
  };

  this.isMSC = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'MSC';
  };

  this.setUSD = function () {
    return this.setCurrency('USD');
  };

  this.setBTC = function () {
    return this.setCurrency('BTC');
  };

  this.setXRP = function () {
    return this.setCurrency('XRP');
  };

  this.setMSC = function () {
    return this.setCurrency('MSC');
  };

  this.amountParamsParser = function (amount) {
    var parsedAmount;
    if (this.isUSD()) {
      parsedAmount = parseInt(amount, 10);
    } else if (this.isBTC() || this.isXRP() || this.isMSC()) {
      parsedAmount = parseFloat(amount);
    }
    return parsedAmount;
  };

  // Load value from cookies, or set to USD
  this.value = this.getValueFromCookie() || 'USD';

});
