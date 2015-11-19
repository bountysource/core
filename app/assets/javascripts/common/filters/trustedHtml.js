'use strict';

angular.module('filters').filter('trusted_html', ['$sce', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);