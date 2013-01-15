with (scope('Solution','App')) {

  define('get_href', function(solution) {
    return '#solutions/'+solution.id;
  });

  // return a pretty element for issue_branch status. Statuses are: started, submitted, disputed, accepted
  define('status_element', function(solution) {
    var the_element = span({ style: 'font-size: 16px;' });

    if (solution.disputed) {
      render({ into: the_element },
        span({ style: 'background: #F3B13C; border-radius: 4px; padding: 4px; color: white' }, 'Disputed')
      );
    } else if (solution.accepted) {
      render({ into: the_element },
        span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Accepted')
      );
    } else if (solution.pull_request) {
      render({ into: the_element },
        span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Submitted')
      );
    } else if (solution.rejected) {
      render({ into: the_element },
        span({ style: 'background: #D11A1A; border-radius: 4px; padding: 4px; color: white' }, 'Rejected')
      );
    } else {
      render({ into: the_element },
        span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Started')
      );
    }

    return the_element;
  });
}