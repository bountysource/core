'use strict';

angular.module('filters').filter('slug', function() {
  return function(val) {
    return (val||"").toLowerCase().replace(/[ ]+/g,'-').replace(/[,.]/g,'').replace(/-(inc|llc)$/,'').replace(/[^a-z0-9-_]/g,'');
  };
});