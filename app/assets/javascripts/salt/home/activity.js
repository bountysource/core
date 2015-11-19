'use strict';

angular.module('app').config(function($stateProvider) {
  $stateProvider.state('root.home.activity', {
    url: "/activity?charts",
    title: "Activity",
    templateUrl: "salt/home/activity.html",
    container: false,
    controller: function($scope, $stateParams, $window, timeline, stats) {
      $scope.events = timeline;
      $scope.all_charts = stats;
      $scope.show_charts = $stateParams.charts;

      if ($scope.show_charts) {

        // rebuild charts on window resize
        angular.element($window).on('resize', function () {
          $scope.viewCharts($scope.time_period);
        });

        $scope.viewCharts = function(time_period, hide_current_period) {
          $scope.time_period = time_period;
          $scope.hide_current_period = hide_current_period;

          var dollar_format = new google.visualization.NumberFormat({ pattern: '$###,###,###' });
          var number_format = new google.visualization.NumberFormat({ pattern: '###,###,###' });
          var default_options = {
            focusTarget: 'category',
            pointSize: 4,
            legend: { position: 'top' },
            chartArea: { left: "10%", top: "10%", height: "70%", width: "90%" },
          };

          var idx;
          if (time_period === 'daily') {
            idx = 0;
          } else if (time_period === 'weekly') {
            idx = 1;
          } else if (time_period === 'monthly') {
            idx = 2;
          } else if (time_period === 'quarterly') {
            idx = 3;
          }

          var labels = $scope.all_charts[idx].labels;
          var series = $scope.all_charts[idx].series;

          // GOTCHA - opposite day... hide_current_period really means show_current_period
          if (!hide_current_period) {
            labels = labels.slice(0,-1);
          }


          /*
          * Donations ($)
          */
          var data = new google.visualization.DataTable();
          data.addColumn('string', 'Period');
          data.addColumn('number', 'Monthly');
          data.addColumn('number', 'One-Time');
          data.addColumn('number', 'Total');
          data.addColumn({type:'number', role:'tooltip'});
          for (var i=0; i < labels.length; i++) {
            data.addRow([
              labels[i],
              (['monthly','quarterly'].indexOf(time_period)>=0) ? series['support_level_payments_sum'][i] : series['support_level_sum'][i],
              series['spent_donations_sum'][i],
              0,
              ((['monthly','quarterly'].indexOf(time_period)>=0) ? series['support_level_payments_sum'][i] : series['support_level_sum'][i]) + series['spent_donations_sum'][i]
            ]);
          }
          dollar_format.format(data, 1);
          dollar_format.format(data, 2);
          dollar_format.format(data, 4);

          var chart = new google.visualization.AreaChart(document.getElementById('chart_donations_sum_summary'));
          chart.draw(data, angular.extend({}, default_options, {
            isStacked: true,
            vAxis: {format:'$###,###,###' },
            series: {
              2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
            }
          }));

          /*
          * Donations (#)
          */
          var data = new google.visualization.DataTable();
          data.addColumn('string', 'Period');
          data.addColumn('number', 'Monthly');
          data.addColumn('number', 'One-time');
          data.addColumn('number', 'Total');
          data.addColumn({type:'number', role:'tooltip'});
          for (var i=0; i < labels.length; i++) {
            data.addRow([
              labels[i],
              (['monthly','quarterly'].indexOf(time_period)>=0) ? series['support_level_payments_cnt'][i] : series['support_level_cnt'][i],
              series['spent_donations_cnt'][i],
              0,
              ((['monthly','quarterly'].indexOf(time_period)>=0) ? series['support_level_payments_cnt'][i] : series['support_level_cnt'][i]) + series['spent_donations_cnt'][i]
            ]);
          }
          number_format.format(data, 1);
          number_format.format(data, 2);
          number_format.format(data, 4);

          var chart = new google.visualization.AreaChart(document.getElementById('chart_donations_count_summary'));
          chart.draw(data, angular.extend({}, default_options, {
            isStacked: true,
            series: {
              2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
            }
          }));

        };

        $scope.viewCharts('weekly');
      }
    },
    resolve: {
      timeline: function($api) {
        return $api.timeline.query({ salt_only: true }).$promise;
      },
      stats: function($api) {
        return $api.stats.query({}).$promise;
      }
    }
  });
});
