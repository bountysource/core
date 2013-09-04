'use strict';

angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fundraisers/:id', {
        templateUrl: 'pages/fundraisers/show.html',
        controller: 'FundraiserShowController'
      });
  })

  .controller('FundraiserShowController', function ($scope, $routeParams, $location, $window, $api, $sanitize, $pageTitle, $metaTags, $filter) {
    $scope.fundraiser = $api.fundraiser_get($routeParams.id);

    // $sanitize but allow iframes (i.e. youtube videos)
    $scope.fundraiser.then(function(fundraiser) {
      if (fundraiser.error) {
        // API returns error if you are not authorized to view it (it hasn't been published)
        // Just redirect to the index page
        $location.url('/fundraisers').replace();
      } else {
        $pageTitle.set(fundraiser.title, 'Fundraisers');
        $metaTags.add({
          'twitter:card':                'product',
          'twitter:site':                '@bountysource',
          'twitter:creator':             '',
          'twitter:title':               fundraiser.title,
          'twitter:description':         fundraiser.short_description,
          'twitter:image:src':           fundraiser.large_image_url,
          'twitter:data1':               $filter('dollars')(fundraiser.total_pledged),
          'twitter:label1':              'Raised',
          'twitter:data2':               $filter('dollars')(fundraiser.funding_goal),
          'twitter:label2':              'Goal',
          'twitter:domain':              'bountysource.com',
          'twitter:app:name:iphone':     '',
          'twitter:app:name:ipad':       '',
          'twitter:app:name:googleplay': '',
          'twitter:app:url:iphone':      '',
          'twitter:app:url:ipad':        '',
          'twitter:app:url:googleplay':  '',
          'twitter:app:id:iphone':       '',
          'twitter:app:id:ipad':         '',
          'twitter:app:id:googleplay':   ''
        });

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

    $scope.pledges = $api.fundraiser_pledges_get($routeParams.id).then(function(pledges) {
      // need to turn amounts into float so that it's sortable
      for (var i in pledges) { pledges[i].amount = parseFloat(pledges[i].amount); }
      return pledges;
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
