'use strict';

angular.module('app').config(function ($routeProvider) {
  $routeProvider.when('/admin/new_kpi', {
    templateUrl: 'admin/kpi/new_kpi.html',
    controller: 'NewKpiController'
  });
})
.controller('NewKpiController', function ($scope, $location, $api) {

  $scope.last_six_days = [
    moment().subtract("days", 1).format('dddd'),
    moment().subtract("days", 2).format('dddd'),
    moment().subtract("days", 3).format('dddd'),
    moment().subtract("days", 4).format('dddd'),
    moment().subtract("days", 5).format('dddd'),
    moment().subtract("days", 6).format('dddd'),
  ];

  // barf
  $scope.last_13_weeks = [
    moment().subtract("weeks", 1).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 2).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 3).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 4).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 5).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 6).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 7).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 8).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 9).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 10).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 11).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 12).startOf('week').add("days", 1).format("DD-MMM"),
    moment().subtract("weeks", 13).startOf('week').add("days", 1).format("DD-MMM")
  ];

  $scope.last_twelve_months = [
    moment().format('MMMM'),
    moment().subtract("months", 1).format('MMMM'),
    moment().subtract("months", 2).format('MMMM'),
    moment().subtract("months", 3).format('MMMM'),
    moment().subtract("months", 4).format('MMMM'),
    moment().subtract("months", 5).format('MMMM'),
    moment().subtract("months", 6).format('MMMM'),
    moment().subtract("months", 7).format('MMMM'),
    moment().subtract("months", 8).format('MMMM'),
    moment().subtract("months", 9).format('MMMM'),
    moment().subtract("months", 10).format('MMMM'),
    moment().subtract("months", 11).format('MMMM'),
    moment().subtract("months", 12).format('MMMM'),
  ];

  $scope.monetary = function(key) {
    if (key.match(/avg/) || key.match(/sum/)) {
      return true;
    } else {
      return false;
    }
  };

  var new_kpis = [
    "active_users",
    "person_cnt",
    "returning_users",
    "team_cnt",
    "active_team_cnt",
    "paying_users_count",
    "bounty_sum",
    "pledge_sum",
    "team_donation_sum",
    "fund_team_account_sum",
    "dev_earnings_bounty_sum",
    "cash_outs_sum",
    "plugin_install_cnt",
    "gross_sales_sum"
  ];

  $scope.prettyNameMap = [
    { raw: "active_users", pretty: "Active Users"},
    { raw: "person_cnt", pretty: "- New Users"},
    { raw: "returning_users", pretty: "- Returning Users"},
    { raw: "team_cnt", pretty: "New Teams"},
    { raw: "active_team_cnt", pretty: "Active Teams"},
    { raw: "paying_users_count", pretty: "Customers"},
    { raw: "gross_sales_sum", pretty: "Gross Sales"},
    { raw: "bounty_sum", pretty: "- Bounty"},
    { raw: "pledge_sum", pretty: "- Pledge"},
    { raw: "team_donation_sum", pretty: "- Team Donation"},
    { raw: "fund_team_account_sum", pretty: "- Fund Team Account"},
    { raw: "dev_earnings_bounty_sum", pretty: "Bounties Claimed"},
    { raw: "cash_outs_sum", pretty: "Cash Outs"},
    { raw: "plugin_install_cnt", pretty: "GH Plugin Installs"}
  ];

  $scope.prettyName = function (name) {
    for (var i = 0; i < $scope.prettyNameMap.length; i++) {
      if($scope.prettyNameMap[i].raw === name) {
        return $scope.prettyNameMap[i].pretty;
      }
    }
  };

  // we only care about certain KPIs for this view. Select only the relevant ones.
  function filterStats (stats) {
    for (var time_key in stats) {
      for (var stat in stats[time_key]) {
        // if stat is not in whitelist, remove it from the stat object
        if (new_kpis.indexOf(stat) < 0) {
          delete stats[time_key][stat];
        }
      }
    }
  }

// might just be easier to write out each row for filtering purposes

  $scope.stats = $api.get_stats().then(function(response) {
    var stats = {daily_stats: {}, weekly_stats: {}, monthly_stats: {}};
    for (var key in response) {
      var offset = key.match(/trend/) ? 0 : parseInt(key.replace(/[a-z]+_/,'')) + 1;

      var hash_key = null;
      if (key.match(/day/)) { hash_key = 'daily_stats'; }
      else if (key.match(/week/)) { hash_key = 'weekly_stats'; }
      else if (key.match(/month/)) { hash_key = 'monthly_stats'; }

      for (var stat in response[key]) {
        if (!stats[hash_key][stat]) { stats[hash_key][stat] = []; }
        stats[hash_key][stat][offset] = response[key][stat];
      }
    }
    // destructive method deletes keys that aren't in white list
    filterStats(stats);
    return stats;
  });

  // Set Default radio button
  $scope.radioModel = "Daily";
});
