'use strict';

angular.module('app.services').service('$cart', function($rootScope, $api, $q, $cookieStore) {

  /*
  * Represents item added to cart
  * */
  var Item = function(type, attributes) {
    var type = type;
    var attributes = attributes || {};
  };

  /*
  * NOTE: Use $cart.load() to get a Cart object in your controllers.
  * */
  var Cart = function(attributes) {
    attributes = attributes || {};
    this.items = attributes.items || [];
    this.synced_at = undefined;

    /*
     * Add item to the cart.
     *
     * @param type - the type of item. "Pledge" "Bounty" etc.
     * @param price - the price of item.
     * @param attributes - optional attributes for the item.
     * @return self
     * */
    this.add_item = function(type, price, attributes) {
      return this;
    };

    /*
    * Remove item from the cart.
    *
    * @param index - the location of the item to remove.
    * */
    this.remove_item = function(index) {
      return this;
    };

    /*
    * Update item in the cart with new attributes.
    * Pushes updates to server-side cart
    *
    * @param index - the location of the item to update.
    * @param attributes - the changes to apply to the item.
    * @return self
    * */
    this.update_item = function(index, attributes) {
      return this;
    };

    /*
     * Clear the cart of all items.
     * Pushes updates to server-side cart
     *
     * @return promise of updated self
     * */
    this.clear = function() {
      var deferred = $q.defer();

      this.initialize_local_cart();
      this.sync();

      return deferred.promise;
    };

    /*
     * Sync the local and remote carts, if logged in.
     * NOTE: client-side changes always overwrite server-side attributes.
     *
     * @return promise of updated self.
     * */
    this.sync = function() {
      var deferred = $q.defer();
      var that = this;

      $rootScope.$watch('current_person', function(person) {
        if (person) {

          $api.call('/cart/sync', 'POST', that).then(function() {

          });

        } else if (person === false) {
          // If not logged in, reject the promise.
          deferred.reject(false);
        }
      });

      return deferred.promise;
    };
  };

  /*
  * Load shopping cart. If you're authenticated, load from server.
  * Otherwise, load client-side cart from cookie.
  *
  * @return promise of the cart object.
  * */
  this.load = function() {
    var deferred = $q.defer();
    var that = this;

    $rootScope.$watch('current_person', function(person) {
      if (person) {
        console.log('logged in', person);
        console.log('loading cart from server...');

        $api.get_cart().then(function(cart) {
          deferred.resolve(cart);
        });


      } else if (person === false) {
        var local_cart = $cookieStore.get('cart');

        console.log('not logged in');
        console.log('is the client-side cart initialized?', local_cart);

        if (!local_cart) {
          local_cart = new Cart();
          console.log('initializing client-side cart...', local_cart);

          $cookieStore.put('cart', local_cart);
          deferred.resolve(local_cart);
        }
      }
    });

    return deferred.promise;
  };

});