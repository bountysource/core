with (scope('BountySource')) {

  define('api_host', 'https://api.bountysource.com/');
  define('www_host', window.location.origin+'/');

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
      if (response && response.meta && parseInt(response.meta.status) == 401) {
        Storage.remove('access_token');
        set_route('#login');
      } else {
        callback.call(this, response);
      }
    };
    
    JSONP.get(options);
  });

  define('login', function(email, password, callback) {
    api('/user/login', 'POST', { email: email, password: password }, callback);
  });

  define('logout', function() {
    Storage.clear({ except: ['environment'] });
    set_route('#', { reload_page: true });
  });

  define('user_info', function(callback) {
    api('/user', callback);
  });
  
  define('get_cached_user_info', function(callback) {
    if (Storage.get('user_info')) {
      callback(JSON.parse(Storage.get('user_info')));
    } else {
      user_info(function(response) {
        if (response.meta.success) {
          set_cached_user_info(response.data);
          callback(response.data);
        }
      });
    }
  });

  define('set_cached_user_info', function(hash) {
    hash ? Storage.set('user_info', JSON.stringify(hash)) : Storage.remove('user_info');
  });

  define('basic_user_info', function(callback) {
    api('/user', 'GET', { basic: true }, callback);
  });

  define('create_account', function(data, callback) {
    api('/user', 'POST', data, callback);
  });

  define('update_account', function(data, callback) {
    api('/user', 'PUT', data, callback);
  });

  define('change_password', function(data, callback) {
    api('/user/change_password', 'POST', data, callback);
  });

  define('reset_password', function(data, callback) {
    api('/user/reset_password', 'POST', data, callback);
  });

  define('request_password_reset', function(data, callback) {
    api('/user/request_password_reset', 'POST', data, callback);
  });

  define('search_users', function(term, callback) {
    api('/github/user/search/' + term, callback);
  });

  define('search_repositories', function(term, callback) {
    api('/github/repos/search', 'GET', { query: term }, callback);
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

  define('create_bounty', function(login, repository, issue_number, amount, payment_method, redirect_url, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/bounties', 'POST', { amount: amount, payment_method: payment_method, redirect_url: redirect_url }, callback);
  });

  define('create_donation', function(repo_full_name, amount, payment_method, redirect_url, callback) {
    api('/github/repos/'+repo_full_name+'/donate', 'POST', { amount: amount, payment_method: payment_method, redirect_url: redirect_url }, callback);
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
  
  define('get_repository_overview', function(login, repository, callback) {
    api('/github/repos/'+login+'/'+repository+'/overview', callback);
  });

  define('create_address', function(data, callback) {
    api('/user/address', 'POST', data, callback);
  });

  define('update_address', function(data, callback) {
    api('/user/address', 'PUT', data, callback);
  });

  define('link_paypal_account', function(data, callback) {
    api('/user/link_paypal', 'POST', data, callback);
  });

  define('get_bounty', function(bounty_id, callback) {
    api('/user/bounties/'+bounty_id, callback);
  });

  define('post_github_comment', function(login, repository, issue_number, form_data, callback) {
    api('/github/repos/'+login+'/'+repository+'/issues/'+issue_number+'/comments', 'POST', form_data, callback);
  });
}
