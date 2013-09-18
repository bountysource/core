/* jshint -W117 */
'use strict';

describe("Issue Show Controller --", function() {

  //////////////////////////////
  ////////// SETUP /////////////
  //////////////////////////////

  // var PROMISE = {
  //   reply_with: function (mock_return) {
  //     return { then: function (handler) {return handler===undefined ? handler() : handler(mock_return);} };
  //   }
  // };

  var mocks = {
    tracker: {
      issues_valuable: jasmine.any(Array),
      issues_popular: jasmine.any(Array),
      issues_newest:  jasmine.any(Array),
      followed: true
    },
    routeParams: {
      amount: 0,
      anonymous: null,
      payment_mehtod: null,
      id: 2
    },
    response: {"data":{"id":2,"slug":"2-remove-all-modals-from-domain-apps","frontend_path":"#issues/2-remove-all-modals-from-domain-apps","title":"Remove all modals from domain apps","short_body":"\n\nThere are still modals in quite a few places.  They should be removed and a new interface should be created as necessary.","url":"https://github.com/badger/frontend/issues/46","comment_count":0,"featured":false,"bounty_total":"0.0","can_add_bounty":true,"created_at":"2012-09-11T21:51:37Z","number":46,"author_name":"ccvergara","author_image_url":"https://1.gravatar.com/avatar/326b3d5ba930f1ccaa07150ce3c8a967?d=https%3A%2F%2Fidenticons.github.com%2Fc56420784c36acbb46b55f7148ccb772.png","frontend_url":"https://www-qa.bountysource.com/#issues/2-remove-all-modals-from-domain-apps","body_html":"<p><a href=\"http://www.bountysource.com/\"><img src=\"https://a248.e.akamai.net/camo.github.com/9643f5a544c126bc8b6385bebbc5318ed77c4f6d/687474703a2f2f692e696d6775722e636f6d2f52414d32582e706e67\" style=\"max-width:100%;\"></a><a></a></p>\n\n<p>There are still modals in quite a few places.  They should be removed and a new interface should be created as necessary.</p>\n","account":null,"tracker":{"id":28,"slug":"28-badger-frontend","name":"Badger Frontend","frontend_path":"#trackers/28-badger-frontend","frontend_url":"https://www-qa.bountysource.com/#trackers/28-badger-frontend","image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_100,h_100/e2655db8ba11d6c1091400b342fb99df","medium_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_200,h_200/e2655db8ba11d6c1091400b342fb99df","large_image_url":"https://cloudinary-a.akamaihd.net/bountysource/image/gravatar/d_noaoqqwxegvmulwus0un.png,c_pad,w_400,h_400/e2655db8ba11d6c1091400b342fb99df","full_name":"badger/frontend","url":"https://github.com/badger/frontend","tracker_type":"Github::Repository","description":"The publicly available frontend for Badger.","bounty_total":"25.0","followed":null},"comments":[{"body_html":"<p><a href=\"http://www.bountysource.com/\"><img src=\"https://a248.e.akamai.net/camo.github.com/9643f5a544c126bc8b6385bebbc5318ed77c4f6d/687474703a2f2f692e696d6775722e636f6d2f52414d32582e706e67\"></a><a></a></p>","created_at":"2012-10-21T18:40:58Z","author_name":"wkonkel","author_image_url":"https://secure.gravatar.com/avatar/de9826ac3bdeaa07b61d329abe426ddc?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>more comments</p>","created_at":"2012-10-21T18:41:08Z","author_name":"wkonkel","author_image_url":"https://secure.gravatar.com/avatar/de9826ac3bdeaa07b61d329abe426ddc?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>oh hai</p>","created_at":"2013-01-30T02:29:45Z","author_name":"wkonkel","author_image_url":"https://secure.gravatar.com/avatar/de9826ac3bdeaa07b61d329abe426ddc?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>I placed a $1 dollar bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: <a href=\"https://github.com/badger/frontend/issues/46\" class=\"issue-link\" title=\"Remove all modals from domain apps\">#46</a></p>","created_at":"2013-02-15T21:25:29Z","author_name":"rappo","author_image_url":"https://secure.gravatar.com/avatar/4e32fc6478f3dd6b42cef6e4b7c76979?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>I placed a $1 dollar bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: <a href=\"https://github.com/badger/frontend/issues/46\" class=\"issue-link\" title=\"Remove all modals from domain apps\">#46</a></p>","created_at":"2013-02-15T21:25:33Z","author_name":"rappo","author_image_url":"https://secure.gravatar.com/avatar/4e32fc6478f3dd6b42cef6e4b7c76979?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>I placed a $12 dollar bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: <a href=\"https://www-qa.bountysource.com/#repos/badger/frontend/issues/46\">https://www-qa.bountysource.com/#repos/badger/frontend/issues/46</a></p>","created_at":"2013-02-15T21:44:03Z","author_name":"corytheboyd","author_image_url":"https://secure.gravatar.com/avatar/bdeaea505d059ccf23d8de5714ae7f73?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>I placed a $3 dollar bounty on this issue using BountySource. The bounty total goes to the person whose pull request gets accepted. Add to or claim the bounty here: <a href=\"https://github.com/badger/frontend/issues/46\" class=\"issue-link\" title=\"Remove all modals from domain apps\">#46</a></p>","created_at":"2013-02-15T21:45:14Z","author_name":"rappo","author_image_url":"https://secure.gravatar.com/avatar/4e32fc6478f3dd6b42cef6e4b7c76979?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"},{"body_html":"<p>I am QA!</p>","created_at":"2013-02-16T01:40:23Z","author_name":"corytheboyd","author_image_url":"https://secure.gravatar.com/avatar/bdeaea505d059ccf23d8de5714ae7f73?d=https://a248.e.akamai.net/assets.github.com%2Fimages%2Fgravatars%2Fgravatar-user-420.png"}],"bounties":[],"bounty_claims":[]},"meta":{"status":200,"success":true,"pagination":null}}
  };
  /////////////////////////////////////
  /////////////// TESTS  //////////////
  /////////////////////////////////////

  var api;
  var scope;
  var routeParams;
  var payment;
  var q;
  var httpBackend;

  beforeEach(module('app'));

  describe("Issue Show controller", function() {

    beforeEach(inject(function ($controller, $rootScope, $routeParams, $api, $payment, $httpBackend) {
      scope = $rootScope.$new();
      api = $api;
      payment = $payment;
      routeParams = mocks.routeParams;
      spyOn(api, 'issue_get').andCallThrough();
      $httpBackend.expectGET("https://staging-api.bountysource.com/issues/2?callback=CORS&per_page=250").respond(200, JSON.stringify(mocks.response));

      $controller('IssueShow', {$scope: scope, $routeParams: routeParams, $api: api, $payment: payment});
    }));

    it("should call api to get data for issue show", function() {
      expect(api.issue_get).toHaveBeenCalledWith(routeParams.id);
    });

// TODO: move coverage to test bounty.html and bounty.js
//    it("should initialize a bounty object on scope", function() {
//      expect(scope.bounty).toBeDefined();
//    });
//
//    it("should set the bounty amount to zero by default", function() {
//      expect(scope.bounty.amount).toEqual(0);
//    });
//
//    it("should set bounty anonymity to false by default", function() {
//      expect(scope.bounty.anonymous).toBe(false);
//    });

  });

  describe("Issue show controller (not anonymous)", function() {

    beforeEach(inject(function ($routeParams, $controller, $api, $payment, $q, $httpBackend, $rootScope) {
      httpBackend = $httpBackend;
      q = $q;
      scope = $rootScope.$new();
      api = $api;
      payment = $payment;
      routeParams = mocks.routeParams;
      routeParams.anonymous = true;
      httpBackend.whenGET("https://staging-api.bountysource.com/issues/2?callback=CORS&per_page=250").respond(200, 'CORS(' +  JSON.stringify(mocks.response) +')');
      $controller('IssueShow', {$scope: scope, $routeParams: routeParams, $api: api, $payment: payment});
    }));

    it("should return the mock response as issues", function () {
      var result;
      scope.issue.then(function(data) {
        result = data;
      });
      httpBackend.flush();
      expect(result.id).toBe(mocks.response.data.id);
    });

// TODO: move coverage to test bounty.html and bounty.js
//    it("should call payment process when the create_payment function is called", function() {
//      spyOn(payment, "process");
//      httpBackend.flush();
//      scope.create_payment();
//      expect(payment.process).toHaveBeenCalled();
//    });
//
//    it("should set anonymous to true", function() {
//      expect(scope.bounty.anonymous).toBeTruthy();
//      httpBackend.flush();
//    });

  });
});
