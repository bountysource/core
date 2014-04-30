'use strict';

angular.module('services').service('$currency', function ($rootScope, $cookieStore, $window, $log, $api, $analytics) {

  var self = this;

  this._currencies = ['USD', 'BTC'];
  this._cookieName = 'currencySwitcherValue';

  this.currencyChangedEventName = 'currencyChangedEvent';

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

  this.isUSD = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'USD';
  };

  this.isBTC = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'BTC';
  };

  this.setUSD = function () {
    return this.setCurrency('USD');
  };

  this.setBTC = function () {
    return this.setCurrency('BTC');
  };

  this.amountParamsParser = function (amount) {
    var parsedAmount;
    if (this.isUSD()) {
      parsedAmount = parseInt(amount, 10);
    } else if (this.isBTC()) {
      parsedAmount = parseFloat(amount);
    }
    return parsedAmount;
  };

  // Load value from cookies, or set to USD
  this.value = this.getValueFromCookie() || 'USD';

  /*
   * Convert amount USD to the provided currency
   * @param amount - the amount being converted
   * @param toCurrency - the currency to convert to. defaults to this.value
   * @params fromCurrency - the currency of amount. defaults to USD
   * */
  this.convert = function (amount, toCurrency, fromCurrency) {
    toCurrency = toCurrency || 'USD';
    fromCurrency = fromCurrency || this.value;

    if (this.isUSD(fromCurrency)) {
      switch (toCurrency.toUpperCase()) {
        // USD to USD
        case ('USD'):
          return amount;

        // USD to BTC
        case ('BTC'):
          return amount / this.btcToUsdRate;
      }
    }

    if (this.isBTC(fromCurrency)) {
      switch (toCurrency.toUpperCase()) {
        // BTC to USD
        case ('USD'):
          return amount * this.btcToUsdRate;

        // BTC to BTC ?!?!?
        case ('BTC'):
          return amount;
      }
    }
  };

  this.usdToBtc = function (value) {
    return this.convert(value, 'BTC', 'USD');
  };

  this.btcToUsd = function (value) {
    return this.convert(value, 'USD', 'BTC');
  };

  /*
   * What is the minimum amount accepted for the given currency?
   * If no currency is provided, uses the current default (this.value)
   * */
  this.minAmount = function (currency) {
    currency = currency || this.value;

    switch (currency.toUpperCase()) {
      case ('USD'):
        return 5.0;
        break;

      case ('BTC'):
        return this.usdToBtc(5.0);
        break;

      default:
        $log.error('Invalid currency');
    }
  };

  /*
  * The value of 1 cent in the given currency.
  * If no currency is provided, uses the current default (this.value)
  * */
  this.cent = function (currency) {
    currency = currency || this.value;

    switch (currency.toUpperCase()) {
      case ('USD'):
        return 0.01;
        break;

      case ('BTC'):
        return 0.00000001;
        break;

      default:
        $log.error('Invalid currency');
    }
  };

});
