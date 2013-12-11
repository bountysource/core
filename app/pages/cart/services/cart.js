'use strict';

angular.module('app.services').service('$cart', function($rootScope, $api, $q, $cookieStore) {

  /*
  * Represents item added to cart.
  * */
  var Item = function(type, amount, attributes) {
    this.class = type;
    this.amount = amount;
    this.attributes = attributes || {};

    // Added to cart date, if passed on attributes
    this.added_at = this.attributes.added_at || new Date().getTime();
    delete this.attributes.added_at;
  };

  /*
  * NOTE: Use $cart.load() to get a Cart object in your controllers.
  * */
  var Cart = function(items) {
    this.items = items || [];

    /*
     * Add item to the cart.
     *
     * @param type - the type of item. "Pledge" "Bounty" etc.
     * @param price - the price of item.
     * @param attributes - optional attributes for the item.
     * @return the item that was added
     * */
    this.add_item = function(type, amount, attributes) {
      attributes = attributes || {};

      var item = new Item(type, amount, attributes);
      this.items.push(item);

      // Add item to server-side cart if logged in.
      this._require_person().then(function(person) {
        if (person) {
          $api.cart_add_item(item.class, item.amount, item.attributes).then(function(updated_cart) {
            console.log("item added to cart on server", item, updated_cart);
          });
        }
      });

      return item;
    };

    /*
    * Helper method to add a pledge to the cart.
    * */
    this.add_pledge = function(amount, fundraiser, attributes) {
      attributes = attributes || {};
      attributes.fundraiser_id = fundraiser.id;
      return this.add_item('Pledge', amount, attributes);
    };

    /*
     * Helper method to add a bounty to the cart.
     * */
    this.add_bounty = function(amount, issue, attributes) {
      attributes = attributes || {};
      attributes.issue_id = issue.id;
      return this.add_item('Bounty', amount, attributes);
    };

    /*
    * Remove item from the cart.
    *
    * @param index - the location of the item to remove.
    * @return the item that was removed
    * */
    this.remove_item = function(index) {
      // Remove item from local cart
      var removed_item;
      for (var i=0; i<this.items.length; i++) {
        if (this.items.index === index) {
          removed_item = angular.copy(this.items[i]);
          this.items.splice(i,1);
          break;
        }
      }

      // Remove cart on server
      this._require_person().then(function(person) {
        if (person) {
          $api.cart_remove_item(index).then(function(updated_cart) {
            console.log("item removed from cart on server", removed_item, updated_cart);
          });
        }
      });

      return removed_item;
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
      // Update local version of item
      var updated_item;
      for (var i=0; i<this.items.length; i++) {
        if (this.items[i].index === index) {
          for (var k in attributes) {
            this.items[i][k] = attributes[k];
          }
          updated_item = this.items[i];
          break;
        }
      }

      // Update item on server
      this._require_person().then(function(person) {
        if (person) {
          $api.cart_update_item(index, updated_item.attributes).then(function(updated_cart) {
            console.log("item updated in cart on server", updated_item, updated_cart);
          });
        }
      });

      return updated_item;
    };

    /*
     * Clear the cart of all items.
     * Pushes updates to server-side cart
     *
     * @return self
     * */
    this.clear = function() {
      this.items = [];

      this._require_person().then(function(person) {
        if (person) {
          $api.clear_cart().then(function(updated_cart) {
            console.log("emptied cart on server", updated_cart);
          });
        }
      });

      return this;
    };

    /*
     * Export local cart to server.
     * NOTE: client-side changes always overwrite server-side attributes.
     *
     * @return promise of updated self.
     * */
    this._export = function() {
      var deferred = $q.defer();

      if (local_cart.items.length <= 0) {
        deferred.resolve(this);
      } else {
        this._require_person().then(function(person) {
          if (person) {
            $api.export_cart().then(function(updated_cart) {
              console.log("cart exported to server", updated_cart);
              deferred.resolve(updated_cart);
            });
          } else {
            deferred.reject();
          }
        });
      }

      return deferred.promise;
    };

    /*
    * Helper method to require authenticated person.
    *
    * @return promise of authenticated person
    * */
    this._require_person = function() {
      var deferred = $q.defer();
      $rootScope.$watch('current_person', function(person) {
        if (person) {
          deferred.resolve(person);
        } else if (person === false) {
          deferred.resolve(false);
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

    // If logged in, get cart from server, after exporting local cart
    $rootScope.$watch('current_person', function(person) {
      var local_cart = $cookieStore.get('cart') || new Cart();

      if (person) {
        local_cart._export().then(function(updated_cart) {
          var local_cart = new Cart(updated_cart);
          $cookieStore.put('cart', local_cart);
          deferred.resolve(local_cart);
        });
      } else if (person === false) {

        deferred.resolve(local_cart);
      }
    });

    return deferred.promise;
  };

});