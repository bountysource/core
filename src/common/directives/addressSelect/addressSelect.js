'use strict';

angular.module('directives').directive('addressSelect', function() {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/addressSelect/templates/addressSelect.html',
    replace: true,
    scope: { addressManagerInstance: '=' }
  };

});