'use strict';

angular.module('services').service('$currency', function ($rootScope, $cookieStore, $window, $log, $api, $analytics, $q) {

  var self = this;

  this._currencies = ['USD', 'BTC', 'MSC', 'XRP', 'UBTC'];
  this._cookieName = 'currencySwitcherValue';

  this.currencyChangedEventName = 'currencyChangedEvent';

  var onLoadDeferred = $q.defer();
  this.onLoadPromise = onLoadDeferred.promise;

  // Get BTC price
  this.btcToUsdRate = undefined;
  this.mscToUsdRate = undefined;
  this.xrpToUsdRate = undefined;
  $api.v2.currencies().then(function(response) {
    if (response.success) {
      self.btcToUsdRate = response.data.bitcoin;
      self.ubtcToUsdRate = response.data.bitcoin / 1000000;
      self.mscToUsdRate = response.data.mastercoin;
      self.xrpToUsdRate = response.data.ripple;
      onLoadDeferred.resolve(self);
    } else {
      onLoadDeferred.reject();
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

  this.isUSD = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'USD';
  };

  this.isBTC = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'BTC';
  };
  
  this.isUBTC = function (value) {
    return (angular.isDefined(value) ? value : this.value) === 'UBTC';
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

  this.setUBTC = function () {
    return this.setCurrency('UBTC');
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
    } else if (this.isBTC() || this.isUBTC() || this.isXRP() || this.isMSC()) {
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

    if (fromCurrency === toCurrency) {
      new_amount = amount;

    // USD to BTC
    } else if (this.isUSD(fromCurrency) && this.isBTC(toCurrency)){
      new_amount = amount / this.btcToUsdRate;
      
    // USD to uBTC
    } else if (this.isUSD(fromCurrency) && this.isUBTC(toCurrency)){
      new_amount = amount / this.ubtcToUsdRate;

    // USD to MSC
    } else if (this.isUSD(fromCurrency) && this.isMSC(toCurrency)) {
      new_amount = amount / this.mscToUsdRate;

    // USD to XRP
    } else if (this.isUSD(fromCurrency) && this.isXRP(toCurrency)) {
      new_amount = amount / this.xrpToUsdRate;

    // BTC to USD
    } else if (this.isBTC(fromCurrency) && this.isUSD(toCurrency)){
      new_amount = amount * this.btcToUsdRate;
      
    // BTC to UBTC
    } else if (this.isBTC(fromCurrency) && this.isUBCT(toCurrency)){
      new_amount = amount * 1000000;

    // BTC to MSC
    } else if (this.isBTC(fromCurrency) && this.isMSC(toCurrency)){
      new_amount = this.convert(amount, 'BTC', 'USD') * this.mscToUsdRate;

    // BTC to XRP
    } else if (this.isBTC(fromCurrency) && this.isXRP(toCurrency)){
      new_amount = this.convert(amount, 'BTC', 'USD') * this.xrpToUsdRate;

    // UBTC to USD
    } else if (this.isUBTC(fromCurrency) && this.isUSD(toCurrency)){
      new_amount = amount * this.ubtcToUsdRate;
      
    // UBTC to BTC
    } else if (this.isUBTC(fromCurrency) && this.isUBCT(toCurrency)){
      new_amount = amount / 1000000;

    // UBTC to MSC
    } else if (this.isUBTC(fromCurrency) && this.isMSC(toCurrency)){
      new_amount = this.convert(amount, 'UBTC', 'USD') * this.mscToUsdRate;

    // UBTC to XRP
    } else if (this.isUBTC(fromCurrency) && this.isXRP(toCurrency)){
      new_amount = this.convert(amount, 'UBTC', 'USD') * this.xrpToUsdRate;
            
    // MSC to USD
    } else if (this.isMSC(fromCurrency) && this.isUSD(toCurrency)) {
      new_amount = amount * this.mscToUsdRate;

    // MSC to BTC
    } else if (this.isMSC(fromCurrency) && this.isBTC(toCurrency)) {
      usd = this.convert(amount, 'MSC', 'USD');
      new_amount = this.convert(usd, 'USD', 'BTC');
      
    // MSC to UBTC
    } else if (this.isMSC(fromCurrency) && this.isBTC(toCurrency)) {
      usd = this.convert(amount, 'MSC', 'USD');
      new_amount = this.convert(usd, 'USD', 'UBTC');
      
    // MSC to XRP
    } else if (this.isMSC(fromCurrency) && this.isXRP(toCurrency)) {
      usd = this.convert(amount, 'MSC', 'USD');
      new_amount = this.convert(usd, 'USD', 'XRP');

    // XRP to USD
    } else if (this.isXRP(fromCurrency) && this.isUSD(toCurrency)) {
      new_amount = amount * this.xrpToUsdRate;

    // XRP to BTC
    } else if (this.isXRP(fromCurrency) && this.isBTC(toCurrency)) {
      usd = this.convert(amount, 'XRP', 'USD');
      new_amount = this.convert(usd, 'USD', 'BTC');
      
    // XRP to UBTC
    } else if (this.isXRP(fromCurrency) && this.isBTC(toCurrency)) {
      usd = this.convert(amount, 'XRP', 'USD');
      new_amount = this.convert(usd, 'USD', 'UBTC');

    // XRP to MSC
    } else if (this.isXRP(fromCurrency) && this.isMSC(toCurrency)) {
      usd = this.convert(amount, 'XRP', 'USD');
      new_amount = this.convert(usd, 'USD', 'MSC');
    }

    return new_amount;
  };

  this.usdToBtc = function (value) {
    return this.convert(value, 'USD', 'BTC');
  };
  
  this.btcToUsd = function (value) {
    return this.convert(value, 'BTC', 'USD');
  };
  
  this.usdToUBtc = function (value) {
    return this.convert(value, 'USD', 'UBTC');
  };
  
  this.usdToXrp = function (value) {
    return this.convert(value, 'USD', 'XRP');
  };

  this.xrpToUsd = function (value) {
    return this.convert(value, 'XRP', 'USD');
  };

  this.usdToMsc = function (value) {
    return this.convert(value, 'USD', 'MSC');
  };

  this.mscToUsd = function (value) {
    return this.convert(value, 'MSC', 'USD');
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
        
      case ('UBTC'):
        return overrides.UBTC || 2;
        
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
    return this.isUSD(currencyIso) || this.isBTC(currencyIso) || this.isUBTC(currencyIso);
  };

});
