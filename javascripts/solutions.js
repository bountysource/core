//with (scope('Solutions','App')) {
//
//  // return the message for when an accepted solution is in the dispute period.
//  define('in_dispute_period_message', function(solution) {
//    return span("Your solution was accepted on ", b(date(solution.accepted_at)), ", but is currently in the two week dispute period. You will be awarded the bounty at the end of this period, if there are no outstanding disputes.");
//  });
//
//  // return a pretty element for issue_branch status. Statuses are: started, submitted, disputed, accepted
//  define('status_element', function(issue_branch) {
//    var the_element = span({ style: 'font-size: 16px;' });
//
//    if (issue_branch.disputed) {
//      render({ into: the_element },
//        span({ style: 'background: #F3B13C; border-radius: 4px; padding: 4px; color: white' }, 'Disputed')
//      );
//    } else if (issue_branch.accepted) {
//      render({ into: the_element },
//        span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Accepted')
//      );
//    } else if (issue_branch.pull_request) {
//      render({ into: the_element },
//        span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Submitted')
//      );
//    } else if (issue_branch.rejected) {
//      render({ into: the_element },
//        span({ style: 'background: #D11A1A; border-radius: 4px; padding: 4px; color: white' }, 'Rejected')
//      );
//    } else {
//      render({ into: the_element },
//        span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Started')
//      );
//    }
//
//    return the_element;
//  });
//}