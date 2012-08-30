with (scope('BountySource')) {

  define('api_host', 'https://www.bountysource.com/');

  // parse arguments: url, [http_method], [params], [callback]
  define('api', function() {
    var args = Array.prototype.slice.call(arguments);

    var options = {
      url:       api_host + args.shift().replace(/^\//,''),
      method:    typeof(args[0]) == 'string' ? args.shift() : 'GET',
      params:    typeof(args[0]) == 'object' ? args.shift() : {},
      callback:  typeof(args[0]) == 'function' ? args.shift() : function(){}
    }
    
    // add in our access token
    options.params.access_token = Storage.get('access_token');
    
    JSONP.get(options);
  });

  define('search_users', function(term, callback) {
    api('/github/user/search/' + term, callback);
  });

  define('search_repositories', function(term, callback) {
    api('/github/repos/search/' + term, callback);
  });

  define('search_issues', function(login, repository, term, callback) {
    api('/github/issues/search/'+login+'/'+repository+'/'+term, callback);
  });

  define('get_repository', function(login, repository, callback) {
    api('/github/repos/'+login+'/'+repository, callback);
  });

  define('get_issues', function(login, repository, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues', callback);
  });

  define('get_issue', function(login, repository, issue_number, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number, callback);
  });

  define('logout', function() {
    Storage.remove('access_token');
    set_route('#', { reload_page: true });
  });
}