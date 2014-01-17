'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $routeParams, $location, $window, $api, $sanitize, $pageTitle) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);

    // $sanitize but allow iframes (i.e. youtube videos)
    $scope.fundraiser.then(function(fundraiser) {
      if (fundraiser.error) {
        // API returns error if you are not authorized to view it (it hasn't been published)
        // Just redirect to the index page
        $location.url('/fundraisers').replace();
      } else {
        $pageTitle.set(fundraiser.title, 'Fundraisers');

        if (fundraiser.trackers) {
          $scope.linked_tracker = fundraiser.trackers[0];
        }

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
      }
    });

    $scope.pledge = {
      amount: parseInt($routeParams.amount, 10)
    };

    $scope.pledge_redirect = function(amount) {
      $scope.fundraiser.then(function(fundraiser) {
        amount = amount || $scope.pledge.amount;
        if (angular.isNumber(amount) && fundraiser.published) {
          $location.path("/fundraisers/"+$routeParams.id+"/pledge").search({ amount: amount });
        }
      });
    };

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
