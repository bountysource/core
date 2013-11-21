/* jshint -W117 */
'use strict';

describe('All the wonderful routes we have', function() {
  beforeEach(module('app'));

  describe('About', function() {
    it('should map routes for faq', function() {
      inject(function($route) {
        expect($route.routes['/faq'].controller).toBe('Static');
        expect($route.routes['/faq'].templateUrl).toEqual('pages/about/faq.html');
      });
    });

    it('should map routes for fees', function() {
      inject(function($route) {
        expect($route.routes['/fees'].controller).toBe('Static');
        expect($route.routes['/fees'].templateUrl).toEqual('pages/about/fees.html');
      });
    });
    it('shiould map routes for jobs', function() {
      inject(function($route) {
        expect($route.routes['/jobs'].controller).toBe('Static');
        expect($route.routes['/jobs'].templateUrl).toEqual('pages/about/jobs.html');
      });
    });
    it('should map routes for learn', function() {
      inject(function($route) {
        expect($route.routes['/learn'].controller).toBe('Static');
        expect($route.routes['/learn'].templateUrl).toEqual('pages/about/learn.html');
      });
    });
    it('should map routes for privacy', function() {
      inject(function($route) {
        expect($route.routes['/privacy'].controller).toBe('Static');
        expect($route.routes['/privacy'].templateUrl).toEqual('pages/about/privacy_policy.html');
      });
    });
    it('should map routes for terms', function() {
      inject(function($route) {
        expect($route.routes['/terms'].controller).toBe('Static');
        expect($route.routes['/terms'].templateUrl).toEqual('pages/about/terms.html');
      });
    });
  });

  describe('Activity', function() {
    it('should map routes for bounties', function() {
      inject(function($route) {
        expect($route.routes['/activity/bounties'].controller).toBe('BountyActivity');
        expect($route.routes['/activity/bounties'].templateUrl).toEqual('pages/activity/bounties.html');
      });
    });

    it('should map routes for claims', function() {
      inject(function($route) {
        expect($route.routes['/activity/claims'].controller).toBe('BountyClaimActivity');
        expect($route.routes['/activity/claims'].templateUrl).toEqual('pages/activity/bounty_claims.html');
      });
    });

    it('should map routes for fundraisers', function() {
      inject(function($route) {
        expect($route.routes['/activity/fundraisers'].controller).toBe('FundraiserActivity');
        expect($route.routes['/activity/fundraisers'].templateUrl).toEqual('pages/activity/fundraisers.html');
      });
    });

    it('should map routes for pledges', function() {
      inject(function($route) {
        expect($route.routes['/activity/pledges'].controller).toBe('PledgeActivity');
        expect($route.routes['/activity/pledges'].templateUrl).toEqual('pages/activity/pledges.html');
      });
    });

    it('should map routes for timeline', function() {
      inject(function($route) {
        expect($route.routes['/activity'].controller).toBe('Activity');
        expect($route.routes['/activity'].templateUrl).toEqual('pages/activity/timeline.html');
      });
    });

    it('should map routes for transactions', function() {
      inject(function($route) {
        expect($route.routes['/activity/transactions'].controller).toBe('TransactionActivity');
        expect($route.routes['/activity/transactions'].templateUrl).toEqual('pages/activity/transactions.html');
      });
    });
  });

  describe('Auth', function() {
    it('should map routes for auth confirmation', function() {
      inject(function($route) {
        expect($route.routes['/auth/:provider/confirm'].controller).toBe('AuthConfirmController');
        expect($route.routes['/auth/:provider/confirm'].templateUrl).toEqual('pages/auth/auth.html');
      });
    });
  });

  describe('Enterprise', function() {
    it('should map routes for enterprise index', function() {
      inject(function($route) {
        expect($route.routes['/enterprise'].templateUrl).toEqual('pages/enterprise/index.html');
      });
    });
  });

  describe('Fundraiser_updates', function() {
    it('should map routes for edit', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:fundraiser_id/updates/:id/edit'].controller).toBe('FundraiserEditUpdateController');
        expect($route.routes['/fundraisers/:fundraiser_id/updates/:id/edit'].templateUrl).toEqual('pages/fundraiser_updates/edit.html');
      });
    });

    it('should map routes for show', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:fundraiser_id/updates/:id'].controller).toBe('FundraiserUpdatesShow');
        expect($route.routes['/fundraisers/:fundraiser_id/updates/:id'].templateUrl).toEqual('pages/fundraiser_updates/show.html');
      });
    });
  });

  describe('Fundraisers', function() {
    it('should map routes for fundraiser creation', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/new'].controller).toBe('FundraiserCreateController');
        expect($route.routes['/fundraisers/new'].templateUrl).toEqual('pages/fundraisers/create.html');
      });
    });

    it('should map routes for fundraiser edit', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:id/edit'].controller).toBe('FundraiserEditController');
        expect($route.routes['/fundraisers/:id/edit'].templateUrl).toEqual('pages/fundraisers/edit.html');
      });
    });

    it('should map routes for just fundraiser', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers'].controller).toBe('FundraisersIndex');
        expect($route.routes['/fundraisers'].templateUrl).toEqual('pages/fundraisers/index.html');
      });
    });

    it('should map routes for a complete fundraiser', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/completed'].controller).toBe('FundraisersIndex');
        expect($route.routes['/fundraisers/completed'].templateUrl).toEqual('pages/fundraisers/index.html');
      });
    });

    it('should map routes for rewards', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:id/rewards'].controller).toBe('FundraiserRewardsInfoController');
        expect($route.routes['/fundraisers/:id/rewards'].templateUrl).toEqual('pages/fundraisers/rewards.html');
      });
    });

    it('should map routes for show', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:id'].controller).toBe('FundraiserShowController');
        expect($route.routes['/fundraisers/:id'].templateUrl).toEqual('pages/fundraisers/show.html');
      });
    });

    it('should map routes for updates to fundraiser', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:id/updates'].controller).toBe('FundraiserUpdatesController');
        expect($route.routes['/fundraisers/:id/updates'].templateUrl).toEqual('pages/fundraisers/updates.html');
      });
    });
  });

  describe('Home', function() {
    it('should map routes for the root', function() {
      inject(function($route) {
        expect($route.routes['/'].controller).toBe('HomeCtrl');
        expect($route.routes['/'].templateUrl).toEqual('pages/home/home.html');
      });
    });

    it('should map routes for serarch', function() {
      inject(function($route) {
        expect($route.routes['/search'].controller).toBe('SearchController');
        expect($route.routes['/search'].templateUrl).toEqual('pages/home/search.html');
      });
    });
  });

  describe('Issues', function() {
    it('should map routes for bounties', function() {
      inject(function($route) {
        expect($route.routes['/issues/:id/bounties'].controller).toBe('IssuesBaseController');
        expect($route.routes['/issues/:id/bounties'].templateUrl).toEqual('pages/issues/bounties.html');
      });
    });

    it('should map routes for search', function() {
      inject(function($route) {
        expect($route.routes['/issues/:id/bounty'].controller).toBe('IssuesBaseController');
        expect($route.routes['/issues/:id/bounty'].templateUrl).toEqual('pages/issues/bounty.html');
      });
    });

    it('should map routes for bounty claims', function() {
      inject(function($route) {
        expect($route.routes['/issues/:id/claims'].controller).toBe('IssuesBaseController');
        expect($route.routes['/issues/:id/claims'].templateUrl).toEqual('pages/issues/bounty_claims.html');
      });
    });

    it('should map routes for new issues', function() {
      inject(function($route) {
        expect($route.routes['/issues/new'].controller).toBe('IssueCreateController');
        expect($route.routes['/issues/new'].templateUrl).toEqual('pages/issues/new.html');
      });
    });

    it('should map routes for show', function() {
      inject(function($route) {
        expect($route.routes['/issues/:id'].controller).toBe('IssuesBaseController');
        expect($route.routes['/issues/:id'].templateUrl).toEqual('pages/issues/show.html');
      });
    });
  });

  describe('People', function() {
    it('should map routes for show', function() {
      inject(function($route) {
        expect($route.routes['/people/:id'].controller).toBe('PeopleShow');
        expect($route.routes['/people/:id'].templateUrl).toEqual('pages/people/activity.html');
      });
    });

    it('should map routes for following', function() {
      inject(function($route) {
        expect($route.routes['/people/:id/following'].controller).toBe('PeopleFollowing');
        expect($route.routes['/people/:id/following'].templateUrl).toEqual('pages/people/following.html');
      });
    });
  });

  describe('Pledges', function() {
    it('should map routes for new', function() {
      inject(function($route) {
        expect($route.routes['/tools/installed'].controller).toBe('BaseToolsController');
        expect($route.routes['/tools/installed'].templateUrl).toEqual('pages/tools/installed.html');
      });
    });

    it('should map routes for backers', function() {
      inject(function($route) {
        expect($route.routes['/fundraisers/:id/backers'].controller).toBe('FundraiserPledgeController');
        expect($route.routes['/fundraisers/:id/backers'].templateUrl).toEqual('pages/pledges/index.html');
      });
    });
  });

  describe('Press', function() {
    it('should map routes for press', function() {
      inject(function($route) {
        expect($route.routes['/press'].controller).toBe('PressController');
        expect($route.routes['/press'].templateUrl).toEqual('pages/press/index.html');
      });
    });
  });

  describe('Settings', function() {
    it('should map routes for accounts', function() {
      inject(function($route) {
        expect($route.routes['/settings/accounts'].controller).toBe('AccountSettings');
        expect($route.routes['/settings/accounts'].templateUrl).toEqual('pages/settings/accounts.html');
      });
    });

    it('should map routes for email', function() {
      inject(function($route) {
        expect($route.routes['/settings/email'].controller).toBe('SettingsEmail');
        expect($route.routes['/settings/email'].templateUrl).toEqual('pages/settings/email.html');
      });
    });

    it('should map routes for profile', function() {
      inject(function($route) {
        expect($route.routes['/settings'].controller).toBe('Settings');
        expect($route.routes['/settings'].templateUrl).toEqual('pages/settings/profile.html');
      });
    });
  });

  describe('Signin', function() {
    it('should map routes for callback', function() {
      inject(function($route) {
        expect($route.routes['/signin/callback'].controller).toBe('SigninCallback');
        expect($route.routes['/signin/callback'].template).toEqual('{{ error || "Redirecting..." }}');
      });
    });

    it('should map routes for reset', function() {
      inject(function($route) {
        expect($route.routes['/signin/reset'].controller).toBe('Reset');
        expect($route.routes['/signin/reset'].templateUrl).toEqual('pages/signin/reset.html');
      });
    });

    it('should map routes for signin', function() {
      inject(function($route) {
        expect($route.routes['/signin'].controller).toBe('Signin');
        expect($route.routes['/signin'].templateUrl).toEqual('pages/signin/signin.html');
      });
    });
  });

  describe('Teams', function() {
    it('should map routes for account', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id/account'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id/account'].templateUrl).toEqual('pages/teams/account.html');
      });
    });

    it('should map routes for activity', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id/activity'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id/activity'].templateUrl).toEqual('pages/teams/activity.html');
      });
    });

    it('should map routes for team', function() {
      inject(function($route) {
        expect($route.routes['/teams'].controller).toBe('TeamsIndexController');
        expect($route.routes['/teams'].templateUrl).toEqual('pages/teams/index.html');
      });
    });

    it('should map routes for join', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id/join'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id/join'].templateUrl).toEqual('pages/teams/join.html');
      });
    });

    it('should map routes for manage', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id/members/manage'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id/members/manage'].templateUrl).toEqual('pages/teams/manage_members.html');
      });
    });

    it('should map routes for members', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id/members'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id/members'].templateUrl).toEqual('pages/teams/members.html');
      });
    });

    it('should map routes for new', function() {
      inject(function($route) {
        expect($route.routes['/teams/new'].controller).toBe('NewTeamController');
        expect($route.routes['/teams/new'].templateUrl).toEqual('pages/teams/new.html');
      });
    });

    it('should map routes for settings', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id/settings'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id/settings'].templateUrl).toEqual('pages/teams/settings.html');
      });
    });

    it('should map routes for show', function() {
      inject(function($route) {
        expect($route.routes['/teams/:id'].controller).toBe('BaseTeamController');
        expect($route.routes['/teams/:id'].templateUrl).toEqual('pages/teams/show.html');
      });
    });
  });

  describe('Tools', function() {
    it('should map routes for all', function() {
      inject(function($route) {
        expect($route.routes['/tools'].controller).toBe('BaseToolsController');
        expect($route.routes['/tools'].templateUrl).toEqual('pages/tools/all.html');
      });
    });

    it('should map routes for installed', function() {
      inject(function($route) {
        expect($route.routes['/tools/installed'].controller).toBe('BaseToolsController');
        expect($route.routes['/tools/installed'].templateUrl).toEqual('pages/tools/installed.html');
      });
    });
  });

  describe('Trackers', function() {
    it('should map routes for index', function() {
      inject(function($route) {
        expect($route.routes['/trackers'].controller).toBe('TrackersIndex');
        expect($route.routes['/trackers'].templateUrl).toEqual('pages/trackers/index.html');
      });
    });

    it('should map routes for show', function() {
      inject(function($route) {
        expect($route.routes['/trackers/:id'].controller).toBe('TrackerShow');
        expect($route.routes['/trackers/:id'].templateUrl).toEqual('pages/trackers/show.html');
      });
    });
  });
});
