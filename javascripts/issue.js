with (scope('Issue','App')) {

  // get the link for an issue object
  define('get_href', function(issue) {
    return issue.frontend_path;
  });

  // render a pretty 'open' or 'closed' element
  define('status_element', function(issue) {
    var element = a({ 'class': 'status-indicator', href: issue.frontend_path });

    if (issue.can_add_bounty) {
      element.innerHTML = 'Open';
      add_class(element, 'green');
    } else {
      element.innerHTML = 'Closed';
      add_class(element, 'red');
    }

    return element;
  });

  define('card', function(issue) {
    issue.image_url       = issue.repository.owner.avatar_url;
    issue.description     = issue.body;
    issue.href            = get_href(issue);
    issue.account_balance = issue.bounty_total;
    return issue_card(issue);
  });
}
