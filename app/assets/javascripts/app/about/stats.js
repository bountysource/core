angular.module('app').controller('StatsPageController', function ($scope, $window, $location, $routeParams, $filter, $timeout, Stat) {

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

    if (hide_current_period) {
      labels = labels.slice(0,-1);
    }


    /*
    * Donations ($)
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Salt');
    data.addColumn('number', 'Donations');
    data.addColumn('number', 'Pledges');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['support_level_payments_sum'][i],
        series['spent_donations_sum'][i],
        series['spent_pledges_sum'][i],
        0,
        series['spent_donations_sum'][i] + series['spent_pledges_sum'][i] + series['support_level_payments_sum'][i]
      ]);
    }
    dollar_format.format(data, 1);
    dollar_format.format(data, 2);
    dollar_format.format(data, 3);
    dollar_format.format(data, 5);

    var chart = new google.visualization.AreaChart(document.getElementById('chart_donations_sum_summary'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      vAxis: {format:'$###,###,###' },
      series: {
        3: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));

    /*
    * Donations (#)
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Salt');
    data.addColumn('number', 'Donations');
    data.addColumn('number', 'Pledges');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['support_level_payments_cnt'][i],
        series['spent_donations_cnt'][i],
        series['spent_pledges_cnt'][i],
        0,
        series['support_level_payments_cnt'][i] + series['spent_donations_cnt'][i] + series['spent_pledges_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);
    number_format.format(data, 3);
    number_format.format(data, 5);

    var chart = new google.visualization.AreaChart(document.getElementById('chart_donations_count_summary'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        3: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));


    /*
    * Bounties ($)
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Posted');
    data.addColumn('number', 'Earned');
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['spent_bounties_sum'][i],
        series['earned_bounties_sum'][i]
      ]);
    }
    dollar_format.format(data, 1);
    dollar_format.format(data, 2);

    var chart = new google.visualization.AreaChart(document.getElementById('chart_bounties_sum_summary'));
    chart.draw(data, angular.extend({}, default_options, {
      vAxis: {format:'$###,###,###' }
    }));

    /*
    * Bounties (#)
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Posted');
    data.addColumn('number', 'Earned');
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['bounties_posted_cnt'][i],
        series['bounty_paid_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);

    var chart = new google.visualization.AreaChart(document.getElementById('chart_bounties_count_summary'));
    chart.draw(data, angular.extend({}, default_options, {
    }));



    /*
     * Active Users
     */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Returning');
    data.addColumn('number', 'New');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['active_users_cnt'][i] - series['new_users_cnt'][i],
        series['new_users_cnt'][i],
        0,
        series['active_users_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);
    number_format.format(data, 4);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_active_users'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));


    /*
     * Active Teams
     */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Returning');
    data.addColumn('number', 'New');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['active_teams_cnt'][i] - series['new_teams_cnt'][i],
        series['new_teams_cnt'][i],
        0,
        series['active_teams_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);
    number_format.format(data, 4);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_active_teams'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));


    /*
    * Total Earned Detail
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Salt');
    data.addColumn('number', 'Bounties');
    data.addColumn('number', 'Donations');
    data.addColumn('number', 'Fundraisers');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['support_level_payments_sum'][i],
        series['earned_bounties_sum'][i],
        series['earned_donations_sum'][i],
        series['earned_pledges_sum'][i],
        0,
        series['earned_bounties_sum'][i] + series['earned_donations_sum'][i] + series['earned_pledges_sum'][i] + series['support_level_payments_sum'][i]
      ]);
    }
    dollar_format.format(data, 1);
    dollar_format.format(data, 2);
    dollar_format.format(data, 3);
    dollar_format.format(data, 4);
    dollar_format.format(data, 6);

    var chart = new google.visualization.AreaChart(document.getElementById('chart_earned_detail'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      vAxis: {format:'$###,###,###' },
      series: {
        4: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));

    /*
    * Total Earners
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Teams');
    data.addColumn('number', 'Developers');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['earner_teams_cnt'][i],
        series['earner_developers_cnt'][i],
        0,
        series['earner_teams_cnt'][i]+series['earner_developers_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);
    number_format.format(data, 4);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_earners'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));


    /*
    * Total Spent Detail
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Salt');
    data.addColumn('number', 'Bounties');
    data.addColumn('number', 'Donations');
    data.addColumn('number', 'Fundraisers');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['support_level_payments_sum'][i],
        series['spent_bounties_sum'][i],
        series['spent_donations_sum'][i],
        series['spent_pledges_sum'][i],
        0,
        series['spent_bounties_sum'][i] + series['spent_donations_sum'][i] + series['spent_pledges_sum'][i] + series['support_level_payments_sum'][i]
      ]);
    }
    dollar_format.format(data, 1);
    dollar_format.format(data, 2);
    dollar_format.format(data, 3);
    dollar_format.format(data, 4);
    dollar_format.format(data, 6);

    var chart = new google.visualization.AreaChart(document.getElementById('chart_spent_detail'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      vAxis: {format:'$###,###,###' },
      series: {
        4: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));


    /*
    * Total Spenders
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Teams');
    data.addColumn('number', 'Developers');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['spender_teams_cnt'][i],
        series['spender_developers_cnt'][i],
        0,
        series['spender_teams_cnt'][i]+series['spender_developers_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);
    number_format.format(data, 4);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_spenders'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));




    /*
    * Posted Bounties
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Individuals');
    data.addColumn('number', 'Teams');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['bounties_posted_person_sum'][i],
        series['bounties_posted_team_sum'][i],
        0,
        series['bounties_posted_team_sum'][i]+series['bounties_posted_person_sum'][i]
      ]);
    }
    dollar_format.format(data, 1);
    dollar_format.format(data, 2);
    dollar_format.format(data, 4);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_posted_bounties'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      vAxis: {format:'$###,###,###' },
      series: {
        2: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));



    /*
    * Awarded Bounties
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Amount');
    // data.addColumn('number', 'Unique');
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['earned_bounties_sum'][i]
      ]);
    }
    dollar_format.format(data, 1);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_awarded_bounties'));
    chart.draw(data, angular.extend({}, default_options, {
      vAxes:[
        { format:'$###,###,###', titleTextStyle: {color: '#FF0000'} },
        { titleTextStyle: {color: '#FF0000'} }
      ]
    }));


    /*
    * Number of Bounties
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Posted');
    data.addColumn('number', 'Awarded');
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['bounties_posted_cnt'][i],
        series['bounties_awarded_cnt'][i]
      ]);
    }
    number_format.format(data, 1);
    number_format.format(data, 2);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_bounties_count'));
    chart.draw(data, angular.extend({}, default_options, {
    }));


    /*
    * Issue Actions
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Issue Suggested');
    data.addColumn('number', 'Bounty Posted');
    data.addColumn('number', 'Goal Set');
    data.addColumn('number', 'Solution Started');
    data.addColumn('number', 'Solution Stopped');
    data.addColumn('number', 'Bounty Claimed');
    data.addColumn('number', 'Thumbs');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['issue_suggested_cnt'][i],
        series['bounties_posted_cnt'][i],
        series['developer_goal_set_cnt'][i],
        series['solution_started_cnt'][i],
        series['solution_stopped_cnt'][i],
        series['bounty_claim_cnt'][i],
        series['issue_thumbs_cnt'][i],

        0,(series['issue_thumbs_cnt'][i]+
            series['issue_suggested_cnt'][i]+
            series['bounties_posted_cnt'][i]+
            series['developer_goal_set_cnt'][i]+
            series['solution_started_cnt'][i]+
            series['solution_stopped_cnt'][i]+
            series['bounty_claim_cnt'][i])
      ]);
    }
    var chart = new google.visualization.AreaChart(document.getElementById('chart_issue_actions'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        7: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));



    /*
    * Team Actions
    */
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Period');
    data.addColumn('number', 'Team Member');
    data.addColumn('number', 'Bounty Hunter');
    data.addColumn('number', 'Donation');
    data.addColumn('number', 'Pledge');
    data.addColumn('number', 'Salt');
    data.addColumn('number', 'Total');
    data.addColumn({type:'number', role:'tooltip'});
    for (var i=0; i < labels.length; i++) {
      data.addRow([
        labels[i],
        series['team_member_cnt'][i],
        series['bounty_hunter_cnt'][i],
        series['spent_donations_cnt'][i],
        series['spent_pledges_cnt'][i],
        series['support_level_payments_cnt'][i],

        0,(
            series['bounty_hunter_cnt'][i]+
            series['team_member_cnt'][i]+
            series['support_level_payments_cnt'][i]+
            series['spent_pledges_cnt'][i]+
            series['spent_donations_cnt'][i]
          )
      ]);
    }
    var chart = new google.visualization.AreaChart(document.getElementById('chart_team_actions'));
    chart.draw(data, angular.extend({}, default_options, {
      isStacked: true,
      series: {
        5: { lineWidth: 0, pointSize: 0, visibleInLegend: false }
      }
    }));



  };

  // load data!
  Stat.query(function(response) {
    $scope.all_charts = response;

    // let the view $digest and show the divs first, then render the charts
    $timeout(function() {
      $scope.viewCharts('monthly');
    }, 0);
  });

});
