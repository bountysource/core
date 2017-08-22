angular.module('directives')
.directive('taxFormMessages', function() {
  // Toggles the visibility of the error block. 
  // Is visible when any errors (in fw8_errors.html and fw9_errors.html) are visible
  // Relies on ng-show adding removing .ng-hide, this changes the html of the error block and is picked up by the watch expression
  
  return {
   restrict: "A",
    link: function(scope, elem) {
      var formName = elem.attr("tax-form-messages");

      scope.$watch(function(){ return elem.html() }, function () {
          showErrors(elem[0].querySelector('span:not(.ng-hide)'))
      });

      function showErrors(visible) {
        if(visible) {
          elem.removeClass("ng-hide");
        } else {
          elem.addClass("ng-hide");
        }
      }
    }
  };
});


