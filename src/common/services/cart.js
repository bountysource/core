'use strict';

angular.module('services').service('$cart', function ($rootScope, $window, $q, $cookieStore, $log, $currency, $api, ShoppingCart, ShoppingCartItems) {

  this._cookieName = 'shoppingCartUid';
  this.items = [];

  var self = this;

  this.isEmpty = function () {
    return !angular.isArray(this.items) || this.items.length <= 0;
  };

  /*
  * Add item to cart.
  * @return - promise of item add
  * */
  this.addItem = function (itemType, amount, currency, attributes) {
    var deferred = $q.defer();
    this.find().then(function () {
      var payload = angular.extend(attributes, {
        item_type: itemType,
        amount: amount,
        currency: currency
      });

      ShoppingCartItems.create({ uid: self.getUid() }, payload, function (item) {
        // Add currency to item
        item.currency = $currency.value;

        self.items.unshift(angular.copy(item));
        deferred.resolve(item);
      });
    });
    return deferred.promise;
  };

  this.addPledge = function (pledge) {
    var amount = $window.parseFloat(pledge.amount);
    var currency = pledge.currency;
    return this.addItem('pledge', amount, currency, pledge);
  };

  this.addBounty = function (bounty) {
    var amount = $window.parseFloat(bounty.amount);
    var currency = bounty.currency;
    return this.addItem('bounty', amount, currency, bounty);
  };

  this.addTeamPayin = function (team_payin) {
    var amount = $window.parseFloat(team_payin.amount);
    var currency = team_payin.currency;
    return this.addItem('team_payin', amount, currency, team_payin);
  };

  /*
  * Find or create cart from server.
  *
  * @param autocreate - create a ShoppingCart on the server if not found. defaults to true
  * @return - promise of cart
  * */
  this.find = function (autocreate) {
    // Default autocreate to true if not specified
    autocreate = angular.isUndefined(autocreate) || autocreate;

    var deferred = $q.defer();
    var uid = this.getUid();

    ShoppingCart.get({
      access_token: $api.get_access_token() || null,
      uid: uid || null,
      autocreate: autocreate
    }, function (cartResource) {
      self.items = angular.copy(cartResource.items);

      // If the cart was associated with a person, the UID of the cart
      // the person already had will be returned. Update the cookie because
      // the old cart was just deleted.
      self.setUid(cartResource.uid);

      deferred.resolve(self);
    });

    return deferred.promise;
  };

  this.getUid = function () {
    return $cookieStore.get(this._cookieName);
  };

  this.setUid = function (uid) {
    return $cookieStore.put(this._cookieName, uid);
  };

  /*
  * Checkout for cart. Result depends on checkout_method.
  * - Google Wallet: Show checkout modal
  * - Paypal: Redirect to checkout page
  * - Coinbase: Redirect to checkout page
  * - Personal: Redirect to receipt page on success
  * - Team: Redirect to receipt page on success
  *
  * @param checkout_method - the method to checkout with
  * */
  this.checkout = function (checkoutMethod) {
    return ShoppingCart.checkout({
      uid: this.getUid(),
      checkout_method: checkoutMethod,
      currency: $currency.value
    }, function () {
      // If checkout is successful, clear the UID cookie so that the new cart takes over
      self.setUid(null);
    });
  };

});
