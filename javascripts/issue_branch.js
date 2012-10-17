with (scope('IssueBranch','App')) {

  // get link to issue_branch
  define('get_href', function(issue_branch) {
    return '/#repos/'+issue_branch.base.repository.full_name+'/issues/'+issue_branch.issue.number+'/issue_branch';
  });

  // render error messages for unaccepted solutions, or solutions still in the dispute period.
  // must provide a target_div, which the error messages will be rendered into.
  // If the solution is good, the callback is executed and passed the solution and user_info objects.
  define('require_accepted_solution', function(login, repository, issue_number, target_div, callback) {
    get_solution(login, repository, issue_number, function(solution, user_info) {
      if (!solution || !solution.accepted) {
        render({ into: target_div },
          error_message("You have not earned this bounty. Get back to work!")
        );
      } else if (solution.in_dispute_period) {
        render({ into: target_div },
          info_message(in_dispute_period_message(solution))
        );
      } else {
        callback(solution, user_info);
      }
    });
  });

  // get the solution given the repo full_name and issue number.
  define('get_solution', function(login, repository, issue_number, callback) {
    if (!Storage.get('access_token')) return callback(false);
    BountySource.user_info(function(response) {
      var user_info = response.data||{};
      for (var i=0; user_info.solutions && i<user_info.solutions.length; i++) {
        if (parseInt(user_info.solutions[i].issue.number) == parseInt(issue_number) && user_info.solutions[i].base.repository.full_name == login+'/'+repository) return callback(user_info.solutions[i], user_info);
      }
      callback(null, user_info);
    });
  });

  // return the message for when an accepted solution is in the dispute period.
  define('in_dispute_period_message', function(solution) {
    return span("Your solution was accepted on ", b(date(solution.accepted_at)), ", but is currently in the two week dispute period. You will be awarded the bounty at the end of this period, if there are no outstanding disputes.");
  });

}