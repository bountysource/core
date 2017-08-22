angular.module('directives')
  .directive('taxFormId', function ($timeout) {
    // Validation and custom display for the 'ssn' and 'employee_id' fields.  
    // Add's hyphens to the display and splits the ID to display the ssn in a 333-22-4444 pattern and the employee_id in a 22-7777777 pattern
    
    var numericRe = /[\D]/g;
    var separator = '-';

    // The "other" property is used to add/remove "required" errors to both fields in sync (needed as the ng-required directive was affected by adding hyphens to the view)
    var fieldInfos = {
      ssn: {pattern: [3,2,4], other: "employee_id"},
      employee_id: {pattern:[2,7], other: "ssn"}
    };

    return {
      restrict: "A",
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {
        elem.attr("style", elem.attr("style") + ";text-indent: " + (10 * scope.formZoom) + "px; letter-spacing:" + (7 * scope.formZoom) + "px");

        // Field name - either "ssn" or "employee_id"
        var field = elem.attr('tax-form-id');
        var fieldInfo = fieldInfos[field];

        // Maximum length (happens to be 9 for both but calculate it anyway)
        var modelLen = fieldInfo.pattern.reduce(function(prev, curr){ return parseInt(curr) + prev}, 0);
        // The view needs one or two extra '-'
        var maxViewLen = modelLen + fieldInfo.pattern.length - 1;
        
        function parser(value) {
          var newVal = value.replace(numericRe, '').substr(0, modelLen);

          var cursorAt = elem[0].selectionStart;

          var newViewVal = formatter(newVal);

          if(value.length > maxViewLen) {
            if(newViewVal[cursorAt] == separator) {
              cursorAt++;
            }
          } else if(value.length < maxViewLen) {
            if(newViewVal[cursorAt] == separator) {
              value = newViewVal.substr(0, cursorAt - 1) + newViewVal.substr(cursorAt+1)
              newViewVal = formatter(value.replace(numericRe, ''));
              cursorAt--;
            }
          }

          ngModel.$viewValue = newViewVal;
          ngModel.$render();
          elem[0].setSelectionRange(cursorAt, cursorAt);

          if(newViewVal[cursorAt] == ' ') {
            selectFirstBlank();
          }

          if(newVal.length > 0) {
            ngModel.$setValidity('required', true);

            if(scope.taxForm[fieldInfo.other].$error.required) {
              scope.taxForm[fieldInfo.other].$setValidity('required', true);
            }

            ngModel.$setValidity('pattern', newVal.length == modelLen);

          } else {
            var required_err = !!scope.data[fieldInfo.other];

            ngModel.$setValidity('required', required_err);
            ngModel.$setValidity('pattern', true); 

            if(scope.taxForm[fieldInfo.other].$error.required == required_err) {
              scope.taxForm[fieldInfo.other].$setValidity('required', required_err);
              scope.taxForm[fieldInfo.other].$pristine = false;
              scope.taxForm[fieldInfo.other].$dirty = true;
            }
          }

          return newVal;
        }

        function formatter(value) {
          if (value == undefined || value == null || value == "") return "";

          // loop over the subsequence lengths(eg [3,2,4]), cut (up to) that many characters from the input. if shorter then pad it with spaces.
          var tok, newVal;
          newVal = fieldInfo.pattern.map(function(num) {
            [tok, value] = [value.substr(0, num), value.substr(num)];

            if(tok.length == num)
              return tok;
            else 
              return tok + "         ".substring(0, num - tok.length);
            
          }).join(separator);

          return newVal;
        }

        ngModel.$parsers.push(parser);
        ngModel.$formatters.push(formatter);


        // When clicked or tabbed to this positions the cursor on the first free space
        function selectFirstBlank() {
          var pos = elem[0].value.indexOf(' ');

          if(pos == -1) {
            elem[0].setSelectionRange(elem[0].value.length, elem[0].value.length)
          } else {
            elem[0].setSelectionRange(pos, pos)
          }
        }
        
        // Only allow numeric characters to be input
        elem.on("keydown", function(ev) {
          if(ev.code.substr(0,5) != 'Digit' && ev.code != ev.key && ev.ctrlKey == false) {
            ev.stopPropagation();
            ev.preventDefault();
            return false;
          }
        })

        elem.on('click', function() {
          // Allow highlighting range for cut & paste (if range contains any input characters)
          if(elem[0].selectionStart != elem[0].selectionEnd) {
            var selected = elem[0].value.substring(elem[0].selectionStart, elem[0].selectionEnd);

            if(selected.replace(numericRe, '').length == 0) {
              selectFirstBlank()
            }

            return;
          }

          var idx = elem[0].selectionStart;
          var char = elem[0].value[idx];

          if(char == ' '  || char == undefined) {
            selectFirstBlank();
          } else if (char == separator && elem[0].value[idx - 1] == ' ') {
            selectFirstBlank();
          }
        })

        // Suppress the vaidation error while focused 
        elem.on('focus', selectFirstBlank);

        elem.on('blur', function() {
          $timeout(function() {
            ngModel.blurred = true;
          });
        });

      }
    }
  });




























// angular.module('directives')
//   .directive('taxFormId', function ($timeout) {
//     // Validation and custom display for the 'ssn' and 'employee_id' fields.  
//     // Add's hyphens to the display and splits the ID to display the ssn in a 333-22-4444 pattern and the employee_id in a 22-7777777 pattern
    
//     var numericRe = /[\D]/g;
//     var separator = '-';

//     // The "other" property is used to add/remove "required" errors to both fields in sync (needed as the ng-required directive was affected by adding hyphens to the view)
//     var fieldInfos = {
//       ssn: {pattern: [3,2,4], other: "employee_id"},
//       employee_id: {pattern:[2,7], other: "ssn"}
//     };

//     return {
//       restrict: "A",
//       require: 'ngModel',
//       link: function(scope, elem, attrs, ngModel) {
//         elem.attr("style", elem.attr("style") + ";text-indent: " + (10 * scope.formZoom) + "px; letter-spacing:" + (7 * scope.formZoom) + "px");

//         // Field name - either "ssn" or "employee_id"
//         var field = elem.attr('tax-form-id');
//         var fieldInfo = fieldInfos[field];

//         // Maximum length (happens to be 9 for both but calculate it anyway)
//         var modelLen = fieldInfo.pattern.reduce(function(prev, curr){ return parseInt(curr) + prev}, 0);
//         // The view needs one or two extra '-'
//         var maxViewLen = modelLen + fieldInfo.pattern.length - 1;
        
//         function parser(value) {
//           var newVal = value.replace(numericRe, '').substr(0, modelLen);

//           var cursorAt = elem[0].selectionStart;

//           var newViewVal = formatter(newVal);

//           if(value.length > maxViewLen) {
//             if(newViewVal[cursorAt] == separator) {
//               cursorAt++;
//             }
//           } else if(value.length < maxViewLen) {
//             if(newViewVal[cursorAt] == separator) {
//               value = newViewVal.substr(0, cursorAt - 1) + newViewVal.substr(cursorAt+1)
//               newViewVal = formatter(value.replace(numericRe, ''));
//               cursorAt--;
//             }
//           }

//           ngModel.$viewValue = newViewVal;
//           ngModel.$render();
//           elem[0].setSelectionRange(cursorAt, cursorAt);

//           if(newViewVal[cursorAt] == ' ') {
//             selectFirstBlank();
//           }

//           if(newVal.length > 0) {
//             ngModel.$setValidity('required', true);

//             if(scope.taxForm[fieldInfo.other].$error.required) {
//               scope.taxForm[fieldInfo.other].$setValidity('required', true);
//             }

//             ngModel.$setValidity('pattern', newVal.length == modelLen);

//           } else {
//             var required_err = !!scope.data[fieldInfo.other];

//             ngModel.$setValidity('required', required_err);
//             ngModel.$setValidity('pattern', true); 

//             if(scope.taxForm[fieldInfo.other].$error.required == required_err) {
//               scope.taxForm[fieldInfo.other].$setValidity('required', required_err);
//               scope.taxForm[fieldInfo.other].$pristine = false;
//               scope.taxForm[fieldInfo.other].$dirty = true;
//             }
//           }

//           return newVal;
//         }

//         function formatter(value) {
//           if (value == undefined || value == null || value == "") return "";

//           // loop over the subsequence lengths(eg [3,2,4]), cut (up to) that many characters from the input. if shorter then pad it with spaces.
//           var tok, newVal;
//           newVal = fieldInfo.pattern.map(function(num) {
//             [tok, value] = [value.substr(0, num), value.substr(num)];

//             if(tok.length == num)
//               return tok;
//             else 
//               return tok + "         ".substring(0, num - tok.length);
            
//           }).join(separator);

//           return newVal;
//         }

//         ngModel.$parsers.push(parser);
//         ngModel.$formatters.push(formatter);


//         // When clicked or tabbed to this positions the cursor on the first free space
//         function selectFirstBlank() {
//           var pos = elem[0].value.indexOf(' ');

//           if(pos == -1) {
//             elem[0].setSelectionRange(elem[0].value.length, elem[0].value.length)
//           } else {
//             elem[0].setSelectionRange(pos, pos)
//           }
//         }
        
//         // Only allow numeric characters to be input
//         elem.on("keydown", function(ev) {
//           if(ev.code.substr(0,5) != 'Digit' && ev.code != ev.key && ev.ctrlKey == false) {
//             ev.stopPropagation();
//             ev.preventDefault();
//             return false;
//           }
//         })

//         elem.on('click', function() {
//           // Allow highlighting range for cut & paste (if range contains any input characters)
//           if(elem[0].selectionStart != elem[0].selectionEnd) {
//             var selected = elem[0].value.substring(elem[0].selectionStart, elem[0].selectionEnd);

//             if(selected.replace(numericRe, '').length == 0) {
//               selectFirstBlank()
//             }

//             return;
//           }

//           var idx = elem[0].selectionStart;
//           var char = elem[0].value[idx];

//           if(char == ' '  || char == undefined) {
//             selectFirstBlank();
//           } else if (char == separator && elem[0].value[idx - 1] == ' ') {
//             selectFirstBlank();
//           }
//         })

//         // Suppress the vaidation error while focused 
//         elem.on('focus', selectFirstBlank);

//         elem.on('blur', function() {
//           $timeout(function() {
//             ngModel.blurred = true;
//           });
//         });

//       }
//     }
//   });
