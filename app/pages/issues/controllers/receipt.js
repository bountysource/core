'use strict';

angular.module('app')
    .config(function ($routeProvider, $person)
    {
       $routeProvider.when('/issues/receipt',
        {
            templateUrl: 'pages/issues/receipt.html',
            controller: 'IssueReceiptController',
            resolve: $person
        });
    })
    .controller('IssueReceiptController', function($scope, $routeParams, $window, $location, $api)
    {
        /*  Basic validation of querystring parameters; redirect if they're not present. */
        if ( $routeParams.timestamp == null ||
             $routeParams.amount == null ||
             $routeParams.anonymous == null ||
             $routeParams.tracker == null ||
             $routeParams.issue == null )
        {
            $location.url("/");
        }

        $scope.date = moment.unix($routeParams.timestamp).format('MMMM D, YYYY');
        $scope.amount = $routeParams.amount;
        $scope.anonymous = $routeParams.anonymous;

        /*  Grab the issue details for the bounty. */
        $api.issue_get($routeParams.issue).then(function(issue)
        {
            $scope.issue = issue;
        });

        /*  Get a tracker for following the project. */
        $api.tracker_get($routeParams.tracker).then(function(tracker)
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

