'use strict';

angular.module('directives').directive('fundraiserEditForm', function() {
  return {
    restrict : 'EAC',
    templateUrl: 'common/directives/fundraiserEditForm/templates/fundraiserEditForm.html',
    require: 'ngModel'
  };
});
