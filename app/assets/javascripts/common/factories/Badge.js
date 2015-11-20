angular.module('factories').factory('Badge', function ($api) {

  var Badge = function () {};

  Badge.prototype.frontendUrl = function () {
    return this.baseFrontendUrl() + '?' + $api.toKeyValue(this.utmParams());
  };

  Badge.prototype.html = function () {
    return '<a href="' + this.frontendUrl() + '"><img src="' + this.imageUrl() + '" /></a>';
  };

  Badge.prototype.markdown = function () {
    return '[![Bountysource](' + this.imageUrl() + ')](' + this.frontendUrl() + ')';
  };

  Badge.prototype.bbcode = function () {
    return '[url=' + this.frontendUrl() + '][img]' + this.imageUrl() + '[/img][/url]';
  };

  return Badge;

});