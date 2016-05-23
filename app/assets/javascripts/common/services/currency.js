angular.module('services').service('$currency', function ($rootScope, $cookieJar, $window, $log, $api, $analytics, $q) {

  var self = this;

  this._currencies = ['USD', 'BTC', 'BLK', 'MSC', 'XRP'];
  this._cookieName = 'currencySwitcherValue';

  this.currencyChangedEventName = 'currencyChangedEvent';

  var onLoadDeferred = $q.defer();
  this.onLoadPromise = onLoadDeferred.promise;

  // Get cryptocurrency prices
  this.toUsdRates = {'USD': 1};
  $api.v2.currencies().then(function(response) {
    if (response.success) {
      self.toUsdRates['BTC'] = response.data.bitcoin;
      self.toUsdRates['BLK'] = response.data.blackcoin;
      self.toUsdRates['MSC'] = response.data.mastercoin;
      self.toUsdRates['XRP'] = response.data.ripple;
      onLoadDeferred.resolve(self);
    } else {
      onLoadDeferred.reject();
      $log.error('Failed to get currency values');
    }
  });

  this.rateToUsd = function(symbol) {
    return self.toUsdRates[symbol];
  };

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
    return $cookieJar.setJson(this._cookieName, this.value);
  };

  this.getValueFromCookie = function() {
    return $cookieJar.getJson(this._cookieName);
  };

  this.isUSD = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'USD';
  };

  this.isBTC = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'BTC';
  };

  this.isBLK = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'BLK';
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

  this.setBLK = function () {
    return this.setCurrency('BLK');
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
    } else if (this.isBTC() || this.isBLK() || this.isXRP() || this.isMSC()) {
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
  this.convert = function (amount, fromCurrency, toCurrency) {
    var new_amount, usd;
    toCurrency = toCurrency || 'USD';
    fromCurrency = fromCurrency || this.value;
    return amount * this.rateToUsd(fromCurrency) / this.rateToUsd(toCurrency);
  };

  /*
  * What is the precision for the current currency?
  *
  * @param currencyIso - the currency ISO to return precision for. Defaults to $currency.value
  * @overrides - Manually change the precision of a currency ISO. Ex. { 'USD': 2, 'BTC': 8 }
  * */
  this.precision = function (currencyIso, overrides) {
    currencyIso = currencyIso || this.value;
    overrides = overrides || {};
    switch (this.value) {
      case ('USD'):
        return overrides.USD || 0;

      case ('BTC'):
        return overrides.BTC || 3;

      case ('BLK'):
        return overrides.BLK || 3;

      case ('XRP'):
        return overrides.XRP || 0;
    }
  };

  /*
  * Does the currency have a symbol? For example, the symbol for USD is $.
  *
  * @return - true if currency has a symbol. otherwise, false.
  * */
  this.hasSymbol = function (currencyIso) {
    currencyIso = currencyIso || this.value;
    return this.isUSD(currencyIso) || this.isBTC(currencyIso);
  };

});
