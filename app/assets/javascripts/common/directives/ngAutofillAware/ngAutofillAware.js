'use strict';

/*
*  Adding ng-autofill-aware to a <form> forces it to emit 'input' events on a variety of events
*  typically triggered by autofills by the browser or password managers.
* */
angular.module('directives').directive('ngAutofillAware', function() {
  return function(scope, element) {
    // listen for pertinent events to trigger input on form element
    // use timeout to ensure val is populated before triggering 'input'
    // ** 'change' event fires for Chrome/Firefox
    // ** 'keydown' for Safari 6.0.1
    // ** 'propertychange' for IE
    element.bind('change keydown propertychange', function() {
      // Trigger 'input' so underlying model changes. Don't wrap in scope.$apply as the handler
      // will trigger its own $apply.
      element.find('input').triggerHandler('input');
    });
  };
});