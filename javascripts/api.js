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
    
    // reload the page if they're not authorized
    var callback = options.callback;
    options.callback = function(response) {
      if (Storage.get('access_token') && response && response.meta && response.meta.status == 401) {
        Storage.remove('access_token')
        window.location.reload();
      } else {
        callback.call(this, response);
      }
    };
    
    JSONP.get(options);
  });

  define('logout', function() {
    Storage.remove('access_token');
    set_route('#', { reload_page: true });
  });

  define('user_info', function(callback) {
    BountySource.api('/user', callback);
  });

  define('login', function(email, password, callback) {
    BountySource.api('/user', 'GET', { email: email, password: password }, callback);
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

  define('overview', function(callback) {
    api('/overview', callback);
  });

  define('create_bounty', function(login, repository, issue_number, amount, payment_method, return_url, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/bounties', 'POST', { amount: amount, payment_method: payment_method, return_url: return_url }, callback);
  });

  define('get_user_repositories', function(callback) {
    api('/github/user/repos/', callback);
  });

  define('create_solution', function(login, repository, issue_number, branch_name, callback) {
    // first, fork repo
    api('/github/repos/'+login+'/'+repository+'/fork', 'POST', function(response) {
      // if the repo fork fails, skip solution creation
      if (!response.meta.success) {
        return callback(response);
      } else {
        var forked_repository = response.data;

        var check_repository = function() {
          BountySource.get_repository(forked_repository.owner, forked_repository.name, function(response) {
            if (response.meta.success) {
              // now we can create the branch, and Solution model
              api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/solution', 'POST', { branch_name: branch_name }, callback);
            } else {
              setTimeout(check_repository, 3000);
            }
          });
        };

        setTimeout(check_repository, 3000);
      }
    });
  });

  define('submit_solution', function(login, repository, issue_number, data, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/solution/submit', 'POST', data, callback);
  });
}