'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $routeParams, $location, $window, $api, $sanitize) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);

    // $sanitize but allow iframes (i.e. youtube videos)
    $scope.fundraiser.then(function(fundraiser) {
      $scope.sanitized_description = "";
      if (fundraiser.description_html) {
        var html = fundraiser.description_html;
        var matches = html.match(/<iframe[^>]+><\/iframe>/g) || [];
        for (var i=0; i < matches.length; i++) {
          html = html.replace(matches[i], '{{iframe:'+i+'}}');
        }
        html = $sanitize(html);
        for (i=0; i < matches.length; i++) {
          html = html.replace('{{iframe:'+i+'}}', matches[i]);
        }
        $scope.sanitized_description = html;
      }
    });

    $scope.pledges = $api.call("/user/fundraisers/"+$routeParams.id+"/pledges", { per_page: "3" }, function(response) {
      if (response.meta.success) {
        var pledges = response.data;
        for (var i in pledges) { pledges[i].amount = parseFloat(pledges[i].amount); }
        return pledges;
      }
    });

    $scope.publish = function(fundraiser) {
      $api.fundraiser_publish(fundraiser.id, function(response) {
        if (response.meta.success) {
          // TODO I do not know why this doesn't work: $location.url("/fundraisers/"+fundraiser.slug).replace();
          $window.location = "/fundraisers/"+fundraiser.slug;
        } else {
          $scope.error = "ERROR: " + response.data.error;
        }

        return response.data;
      });
    };
  });
