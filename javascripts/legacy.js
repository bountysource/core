with (scope('Legacy', 'App')) {

  define('search_and_send_to_issue', function(login, repository, number) {
    Search.perform({ query: 'https://github.com/'+login+'/'+repository+'/issues/'+number });
  });

  define('search_and_send_to_repository', function(login, repository) {
    Search.perform({ query: 'https://github.com/'+login+'/'+repository });
  });

  // legacy redirects
  route('#repos/:login/:repository/issues/:issue_number', search_and_send_to_issue);
  route('#repos/:login/:repository/issues', search_and_send_to_repository);
  route('#repos/:login/:repository', search_and_send_to_repository);

  //route('#repos/:login/:repository/issues/:issue_number/bounties/:bounty_id/receipt', function(login, repository, issue_number, bounty_id) {

}

