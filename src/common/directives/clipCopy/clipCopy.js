'use strict';
angular.module('directives').directive('clipCopy', function() {
  return {
    restrict: 'AE',    
    link: function(scope, elem, attrs) {
      ZeroClipboard.config( { moviePath: "http://cdnjs.cloudflare.com/ajax/libs/zeroclipboard/1.3.2/ZeroClipboard.swf" } );
      var client = new ZeroClipboard(elem);      
    }
  };
});