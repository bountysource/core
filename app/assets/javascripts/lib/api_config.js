angular.module('app').run(function($api) {

  $api.add('teams', {
    params: { slug: '@slug' },
    url: '/teams/:slug',
    methods: {
      silent_query: { method: 'GET', url: '/teams', isArray: true, ignoreLoadingBar: true }
    }
  });

  $api.add('team_members', {
    api_version: 1,
    params: { slug: '@slug' },
    url: '/teams/:slug/members'
  });

  $api.add('people', {
    methods: {
      me: { method: 'GET', url: '/people/me' },
      login: { method: 'POST', url: '/user/login', api_version: 1 },
      create: { method: 'POST', url: '/user', api_version: 1 },
      unsubscribe: { method: 'POST', url: '/people/unsubscribe' },
      request_password_reset: {method: 'POST', url: '/user/request_password_reset', api_version: 1}
    }
  });

  $api.add('issue_suggestions');

  $api.add('backers');
  $api.add('payment_methods');
  $api.add('support_levels', {
    methods: {
      global_summary: { method: 'GET', url: '/support_levels/global_summary' }
    }
  });
  $api.add('supporters');
  $api.add('team_updates', {
    methods: {
      mailing_lists: { method: 'GET', url: '/team_updates/mailing_lists' }
    }
  });

  $api.add('tags');

  $api.add('issues', {
    methods: {
      query_v3: { method: 'GET', url: '/issues/query_v3', isArray: true }
    }
  });

  $api.add('trackers');

  $api.add('thumbs');

  $api.add('timeline');

  $api.add('stats');

  $api.add('support_offering_rewards', {
    params: {id: '@id', team_slug: '@team_slug'},
    methods: {
      'create': { method: 'POST', url: '/teams/:team_slug/support_offering_rewards' }
    }}
  );

});
