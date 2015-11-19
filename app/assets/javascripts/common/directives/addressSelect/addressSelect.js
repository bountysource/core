'use strict';

angular.module('directives').directive('addressSelect', function() {

  return {
    restrict: 'EAC',
    templateUrl: 'common/directives/addressSelect/addressSelect.html',
    replace: true,
    scope: { addressManagerInstance: '=' }
  };

});