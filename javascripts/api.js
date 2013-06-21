with (scope('BountySource')) {

  define('api_host', 'https://api.bountysource.com/');
  define('www_host', document.location.href.split('#')[0]);

  // parse arguments: url, [http_method], [params], [callback]
  define('api', function() {
    var args = Array.prototype.slice.call(arguments);

    var options = {
      url:       api_host + args.shift().replace(/^\//,''),
      method:    typeof(args[0]) == 'string' ? args.shift() : 'GET',
      params:    typeof(args[0]) == 'object' ? args.shift() : {},
      callback:  typeof(args[0]) == 'function' ? args.shift() : function(){},
      non_auth_callback:  typeof(args[0]) == 'function' ? args.shift() : null
    };

    // add in our access token
    options.params.access_token = Storage.get('access_token');

    // reload the page if they're not authorized
    var callback = options.callback;
    options.callback = function(response) {
      if (response && response.meta && parseInt(response.meta.status) == 401) {
        Storage.remove('access_token');
        if (options.non_auth_callback) options.non_auth_callback(response);
        else if (scope.instance.App.unauthorized_callback) scope.instance.App.unauthorized_callback(options);
        else set_route('#');
      } else {
        // turn error message into string, or use default
        if (!response.meta.success) {
          if (!response.data.error) {
            response.data.error = "Unexpected error";
          } else if (response.data.error.push) {
            response.data.error = response.data.error.join(', ');
          }
        }

        callback.call(this, response);
      }
    };
    
    JSONP.get(options);
  });

  define('login', function(params, callback) {
    api('/user/login', 'POST', params, callback);
  });

  define('logout', function() {
    Storage.clear({ except: ['environment'] });
    set_route('#', { reload_page: true });
  });

  define('user_info', function(callback, dont_redirect_to_signin) {
    var non_auth_callback = dont_redirect_to_signin ? function(){} : function() {
      Storage.clear({ except: ['environment'] });
      set_route(get_route(), { reload_page: true });
    };
    api('/user', callback, non_auth_callback);
  });

  define('set_access_token', function(data) {
    if (typeof(data) == 'string') {
      Storage.set('access_token', data);
      BountySource.set_cached_user_info(null);
    } else {
      Storage.set('access_token', data.access_token);
      BountySource.set_cached_user_info(data);
    }
  });

  define('get_cached_user_info', function(callback) {
    if (Storage.get('user_info')) {
      callback(parsed_user_info());
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

  define('parsed_user_info', function() {
    try {
      return JSON.parse(Storage.get('user_info'))
    } catch(e) {
      console.log("ERROR PARSING USER_INFO JSON:", Storage.get('user_info'));
      return {};
    }
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

  define('search', function(query, callback) {
    api('/search', 'POST', { query: query }, callback);
  });

  define('get_tracker', function(tracker_id, callback) {
    api('/trackers/'+tracker_id, callback);
  });

  define('get_issues', function(tracker_id, callback) {
    api('/trackers/'+tracker_id+'/issues', callback);
  });

  define('get_issue', function(issue_id, callback) {
    api('/issues/'+issue_id, callback);
  });

  define('overview', function(callback) {
    api('/overview', callback);
  });

  define('get_user_repositories', function(callback) {
    api('/github/user/repos/', callback);
  });

  define('get_repository_overview', function(tracker_id, callback) {
    api('/trackers/'+tracker_id+'/overview', callback);
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

  define('get_fundraisers', function(callback) {
    api('/user/fundraisers', callback);
  });

  define('get_fundraiser', function(id, callback) {
    api('/user/fundraisers/'+id, callback);
  });

  define('create_fundraiser', function(data, callback) {
    api('/user/fundraisers', 'POST', data, callback);
  });

  define('update_fundraiser', function(id, data, callback) {
    api('/user/fundraisers/'+id, 'PUT', data, callback);
  });

  define('publish_fundraiser', function(id, callback) {
    api('/user/fundraisers/'+id+'/publish', 'POST', callback);
  });

  define('destroy_fundraiser', function(id, callback) {
    api('/user/fundraisers/'+id, 'DELETE', callback);
  });

  define('recent_people', function(callback) {
    api('/user/recent', 'GET', callback);
  });

  define('get_pledge', function(pledge_id, callback) {
    api('/user/pledges/'+pledge_id, callback);
  });

  define('get_user_profile', function(profile_id, callback) {
    api('/users/'+profile_id, callback);
  });

  define('get_rewards', function(fundraiser_id, callback) {
    api('/user/fundraisers/'+fundraiser_id+'/rewards', 'GET', data, callback);
  });

  define('get_reward', function(fundraiser_id, reward_id, callback) {
    api('/user/fundraisers/'+fundraiser_id+'/rewards/'+reward_id, callback);
  });

  define('create_reward', function(fundraiser_id, data, callback) {
    api('/user/fundraisers/'+fundraiser_id+'/rewards', 'POST', data, callback);
  });

  define('update_reward', function(fundraiser_id, reward_id, data, callback) {
    api('/user/fundraisers/'+fundraiser_id+'/rewards/'+reward_id, 'PUT', data, callback);
  });

  define('destroy_reward', function(fundraiser_id, reward_id, callback) {
    api('/user/fundraisers/'+fundraiser_id+'/rewards/'+reward_id, 'DELETE', callback);
  });

  define('get_friends_activity', function(callback) {
    if (scope.__friend_activity) {
      setTimeout(curry(callback, scope.__friend_activity), 0);
    } else {
      api('/user/notifications/friends', function(response) {
        scope.__friend_activity = response;
        callback(response);
      });
    }
    api('/user/notifications/friends', callback);
  });

  /*
  * Solutions
  * */
  define('get_solutions', function(callback) {
    api('/user/solutions', callback);
  });

  define('get_solution', function(id, callback) {
    api('/user/solutions/'+id, callback);
  });

  define('create_solution', function(issue_id, callback) {
    api('/user/solutions', 'POST', { issue_id: issue_id }, callback);
  });

  define('update_solution', function(id, data, callback) {
    api('/user/solutions/'+id, 'PUT', data, callback);
  });

  define('destroy_solution', function(id, data, callback) {
    api('/user/solutions/'+id, 'DELETE', data, callback);
  });

  define('delete_solution', function(id, callback) {
    api('/user/solutions/'+id, 'DELETE', callback);
  });

  define('submit_solution', function(id, callback) {
    api('/user/solutions/'+id+'/submit', 'POST', callback);
  });

  define('solutions_for_issue', function(issue_id, callback) {
    api('/issues/'+issue_id+'/solutions', callback);
  });

  define('create_issue', function(data, callback) {
    api('/issues', 'POST', data, callback);
  });

  define('payout_solution', function(id, data, callback) {
    api('/user/solutions/'+id+'/payout', 'POST', data, callback);
  });

  /*
  * Cards
  * */
  define('get_fundraiser_cards', function(callback) {
    api('/fundraisers/cards', callback);
  });

  define('get_project_cards', function(callback) {
    api('/trackers/cards', callback);
  });

  /*
    Get extended information about a Fundraiser if you are the owner.
    Includes the pledges
  */
  define('get_fundraiser_info', function(fundraiser_id, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/info', callback);
  });


  /*
  * Get contributions for the authenticated user
  * */
  define('get_contributions', function(callback) {
    api('/user/contributions', callback);
  });


  /*
  * Update a pledge with the survey response
  * */
  define('update_pledge', function(pledge_id, data, callback) {
    api('/user/pledges/'+pledge_id, 'PUT', data, callback);
  });

  /*
  * Fundraiser updates
  * */
  define('get_fundraiser_updates', function(fundraiser_id, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/updates', callback);
  });

  define('create_fundraiser_update', function(fundraiser_id, data, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/updates', 'POST', data, callback);
  });

  define('get_fundraiser_update', function(fundraiser_id, update_id, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/updates/' + update_id, callback);
  });

  define('update_fundraiser_update', function(fundraiser_id, update_id, data, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/updates/' + update_id, 'PUT', data, callback);
  });

  define('publish_fundraiser_update', function(fundraiser_id, update_id, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/updates/' + update_id + '/publish', 'POST', callback);
  });

  define('destroy_fundraiser_update', function(fundraiser_id, update_id, callback) {
    api('/user/fundraisers/' + fundraiser_id + '/updates/' + update_id, 'DELETE', callback);
  });
}
