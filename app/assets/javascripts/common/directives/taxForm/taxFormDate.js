angular.module('directives')
  .directive('taxFormDate', function ($timeout) {
    var dateRe = /^\d{2}\/\d{2}\/\d{4}$/;

    var currentYr = parseInt(("" + new Date().getFullYear()).substring(2));

    function yearPart(part, expandYr) { return expandYr && part.length == 2 ? expand2DigitYr(parseInt(part)) : part; }
    function monthPart(part) { return part.length == 2 ? part : "0" + part; }
    function dayPart(part) { return part.length == 2 ? part : "0" + part; }

    function expand2DigitYr(year) { return ((year - currentYr) <= 5 && (year - currentYr) > -5) ? "20" + year : "19" + year; }
    function expand1DigitDate(numbr) { return numbr < 10 ? "0" + numbr : "" + numbr; }

    var inputFormat = {
      "d/m/y": function(parts, expandYr) { return yearPart(parts[2], expandYr) + "-" + monthPart(parts[1]) + '-' + dayPart(parts[0]); },
      "m/d/y": function(parts, expandYr) { return yearPart(parts[2], expandYr) + "-" + monthPart(parts[0]) + '-' + dayPart(parts[1]); }
    };

    var viewDate = {
      "d/m/y": function(date) { return expand1DigitDate(date.getDate()) + "/" + expand1DigitDate(date.getMonth() + 1) + "/" + date.getFullYear(); },
      "m/d/y": function(date) { return expand1DigitDate(date.getMonth() + 1) + "/" + expand1DigitDate(date.getDate()) + "/" + date.getFullYear(); }
    }

    function modelDate(date) { return  date.getFullYear() + "-" + expand1DigitDate(date.getMonth() + 1) + "-" + expand1DigitDate(date.getDate()); }

    return {
      restrict: "A",
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {
        var format = attrs.taxFormDate;
        
        function parser(value) {
          if(!dateRe.test(value)) {
            value = null;
            ngModel.$setValidity('dateFormat', false);
          } else {
            value = inputFormat[format](value.split('/'));

            if(!isNaN(Date.parse(value))) {
              ngModel.$setValidity('dateFormat', true);
              value = modelDate(new Date(value));
            } else {
              ngModel.$setValidity('dateFormat', false);
              value = null;
            }
          }

          return value;
        }


        function formatter(value) {
          var formatted = '';

          if (angular.isDate(value)) {
            formatted = viewDate[format](value);
          }

          return formatted;
        }
        
        function stopEvt(ev) {
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        }

        var padCharsRe = /^(\d|\d\d\/\d)$/;
        var addSlashRe = /^(\d\d|\d\d\/\d\d)$/

        // Only allow numeric characters to be input
        elem.on("keydown", function(evt) {
          if(evt.key == '/') {
            var val = elem[0].value;
            
            if(val.length == 0 || val[val.length - 1] == '/') {
              return stopEvt(evt);
            } else if (val.match(padCharsRe)) {
              elem[0].value = val.substring(0, val.length - 1) + "0" + val[val.length - 1];
            }

          } else if(evt.code.substr(0,5) != 'Digit' && evt.code != evt.key && evt.ctrlKey == false) {
            return stopEvt(evt);
          }
        })

        elem.on('blur', function() {
          $timeout(function(){
            ngModel.blurred = true;
          });

          if(!elem[0].value.length)
            return;
          
          var parts = elem[0].value.split('/');

          if(parts.length != 3)
            return;

          var modelVal = inputFormat[format](parts, true)
          var date = Date.parse(modelVal);
          if(!isNaN(date)) {
            ngModel.$setViewValue(viewDate[format](new Date(date)))
            ngModel.$render();
          }
        });

        ngModel.$parsers.push(parser);
        ngModel.$formatters.push(formatter);
      }
    }
  });
