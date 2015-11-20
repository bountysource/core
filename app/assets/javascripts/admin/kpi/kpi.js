angular.module('app')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/kpi', {
        templateUrl: 'admin/kpi/kpi.html',
        controller: "KpiCtrl"
      });
  })
  .controller("KpiCtrl", function ($scope, $window, $api) {

    $scope.last_six_days = [
        moment().subtract("days", 1).format('dddd'),
        moment().subtract("days", 2).format('dddd'),
        moment().subtract("days", 3).format('dddd'),
        moment().subtract("days", 4).format('dddd'),
        moment().subtract("days", 5).format('dddd'),
        moment().subtract("days", 6).format('dddd'),
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
      return stats;
    });

    $scope.radioModel = "Daily";

    $scope.monetary = function(key) {
      if (key.match(/avg/) || key.match(/sum/)) {
        return true;
      } else {
        return false;
      }
    };

    $scope.red_or_green = function(value,x,y) {
      var change =  ((0.0001+parseFloat(value[x]))/(0.0001+parseFloat(value[y])));
      if (change > 1.5) { return { big_up: true }; }
      else if (change > 1.1) { return { small_up: true }; }
      else if (change < 0.6) { return { big_down: true }; }
      else if (change < 0.9) { return { small_down: true }; }
    };

  });
