'use strict';

angular.module('app')
    .config(function ($routeProvider, $person)
    {
       $routeProvider.when('/fundraisers/receipt',
        {
            templateUrl: 'pages/fundraisers/receipt.html',
            controller: 'PledgeReceiptController',
            resolve: $person
        });
    })
    .controller('PledgeReceiptController', function($scope, $routeParams, $api)
    { 
        if ( $routeParams.timestamp == null ||
             $routeParams.amount == null ||
             $routeParams.anonymous == null ||
             $routeParams.fundraiser == null ||
        {
            $location.url("/");
        }

        $scope.fundraisers = $api.fundraisers_get();
        $scope.fundraiser = $api.fundraiser_get($routeParams.fundraiser);
        $scope.date = moment.unix($routeParams.timestamp).format('MMMM D, YYYY');
        $scope.amount = $routeParams.amount;
        $scope.anonymous = $routeParams.anonymous;

        $api.fundraiser_info_get($routeParams.fundraiser).then(function(fundraiser_info)
        {
            for ( var x = 0; x < fundraiser_info.rewards.length; ++x )
            {
                if ( fundraiser_info.rewards[x].id == $routeParams.reward )
                {
                    $scope.reward = fundraiser_info.rewards[x];
                    break;
                }
            }
        });

        $api.tracker_get($routeParams.fundraiser).then(function(tracker)
        {
            // Follow and unfollow API method wrappers
            tracker.follow = function()
            {
                if ( !$scope.current_person )
                {
                    return $api.require_signin();
                }

                if ( tracker.followed )
                {
                    $api.tracker_unfollow($scope.tracker.id).then(function()
                    {
                       // assume API call success, update the button state (tracker.followed)
                        tracker.followed = false;
                    });
                }
                else
                {
                    $api.tracker_follow($scope.tracker.id).then(function()
                    {
                        // assume API call success, update the button state (tracker.followed)
                        tracker.followed = true;
                    });
                }
            };
        
            $scope.tracker = tracker;
        });
    });

