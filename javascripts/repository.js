with (scope('Repository','App')) {
  // get the link for a repository object
  define('get_href', function(repository) {
    return repository.frontend_path;
  });

  // get link to the issues for a repository
  define('get_issues_href', function(repository) {
    return get_href(repository)+'/issues';
  });
}