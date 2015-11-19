'use strict';

/**
 * TODO add some unit tests, bro.
 * */
angular.module('bountysource').provider('feature', function FeatureProvider () {
  var features = {};

  /**
   * Add a new feature!
   *
   * @param feature {string} the feature to add
   * @param enabled {string} the inital state of the feature. defaults to true
   * */
  this.register = function (feature, enabled) {
    features[feature] = angular.isUndefined(enabled) ? true : enabled;
  };

  this.$get = function ($rootScope, $log) {
    function FeatureService () {
      /**
       * Is the feature enabled?
       * @param feature {string} the feature to check
       * @returns {boolean} returns false if feature is not registered
       * */
      this.enabled = function (feature) {
        return angular.isUndefined(features[feature]) ? false : features[feature];
      };

      /**
       * Is the feature disabled?
       * @param feature {string} the feature to check
       * @returns {boolean} returns true if feature is not registered
       * */
      this.disabled = function (feature) {
        return !this.enabled(feature);
      };

      /**
       * Enable a feature
       * @param feature {string} the feature to enable
       * */
      this.enable = function (feature) {
        this._updateFeature(feature, true);
      };

      /**
       * Disable a feature
       * @param feature {string} the feature to disable
       * */
      this.disable = function (feature) {
        this._updateFeature(feature, false);
      };

      this._updateFeature = function (feature, enabled) {
        if (this._featureRegistered(feature)) {
          features[feature] = enabled;
          $rootScope.$apply();
          if (enabled) {
            $log.info('Feature enabled:', feature);
          } else {
            $log.info('Feature disabled:', feature);
          }
        } else {
          $log.warn("Feature not registered:", feature, "\nUse featureProvider#register to register new features");
        }
      };

      this._featureRegistered = function (feature) {
        return angular.isDefined(features[feature]);
      };
    }

    return new FeatureService();
  };
});