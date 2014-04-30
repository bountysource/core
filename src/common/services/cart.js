'use strict';

angular.module('services').service('$cart', function ($rootScope, $window, $q, $cookieStore, $log, $currency, $api, ShoppingCart, ShoppingCartItems) {

  this._cookieName = 'shoppingCartUid';
  this.items = [];

  var self = this;

  $window.cart = this;

  this.isEmpty = function () {
    return this.items.length <= 0;
  };

  this.addItem = function (itemType, amount, currency, attributes) {
    var payload = angular.extend(attributes, {
      item_type: itemType,
      amount: amount,
      currency: currency
    });
    return ShoppingCartItems.create({ uid: this.getUid() }, payload);
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
  * Return promise of shopping cart instance.
  * Create a new cart if the user does not have a cart token stored locally.
  * */
  this.getInstance = function () {
    var deferred = $q.defer();
    var uid = this.getUid();
    if (uid) {
      ShoppingCart.get({ uid: uid }, function (cart) {
        self.items = angular.copy(cart.items);
        deferred.resolve(self);
        $log.info('Loaded cart from server', cart);
      });
    } else {
      ShoppingCart.create(function (cart) {
        self.setUid(cart.uid);
        deferred.resolve(self);
        $log.info('Created new cart', cart);
      });
    }
    return deferred.promise;
  };

  this.getUid = function () {
    return $cookieStore.get(this._cookieName);
  };

  this.setUid = function (uid) {
    return $cookieStore.put(this._cookieName, uid);
  };

  // Claim the shopping cart loaded from uid on cookie
  this.claim = function (params) {
    var deferred = $q.defer();
    var personWatcher = $rootScope.$watch('current_person', function (person) {
      if (angular.isObject(person)) {
        ShoppingCart.claim(params, function () {
          $log.info('Claimed shopping cart', self);
          personWatcher();
          deferred.resolve(self);
        });
      } else if (person === false) {
        personWatcher();
      }
    });
    return deferred.promise;
  }

});
