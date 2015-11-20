angular.module('app').controller('IssueShowController', function ($scope, $routeParams, $window, $location, $pageTitle, $anchorScroll, $cart, $analytics, $currency, Timeline, BountyClaim, Issue) {
  var issue_id = parseInt($routeParams.id);

  // load core issue object
  $scope.issue = Issue.get({
    id: issue_id,
    include_body_html: true,
    include_author: true,
    include_tracker: true,
    include_team: true,
    include_counts: true
  }, function(issue) {
    $scope.team = issue.team;
    $pageTitle.set($scope.issue.title, $scope.issue.tracker.name);
  });

  // get list of 100 events for issue home page
  $scope.events = Timeline.query({
    per_page: 100,
    issue_id: issue_id
  });

  // create bounty box (allow prefil via &amount=123 in query params)
  $scope.post_custom_bounty = {
    amount: parseInt($routeParams.amount, 10) || null
  };
  $scope.add_bounty_to_cart = function(amount) {
    // Track event
    $analytics.bountyStart({ type: (amount ? 'buttons' : 'custom'), amount: amount });

    return $cart.addBounty({
      amount: amount || $scope.post_custom_bounty.amount,
      currency: amount ? 'USD' : $currency.value,
      issue_id: issue_id
    }).then(function () {
      $location.url("/cart");
    });
  };



//  // google analytics for product info
//  $scope.issue.$promise.then(function(issue) {
//    ga('ec:addImpression', {
//      'id': 'I'+$routeParams.id,
//      'name': issue.name,
//      'category': issue.tracker.display_name
//    });
//    ga('ec:setAction', 'detail');
//    ga('send', 'event', 'Ecommerce', 'Detail', {'nonInteraction': 1});
//  });

});
