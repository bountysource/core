'use strict';

angular.module('directives').directive('shareButton', function ($location, $analytics, $window, $filter) {
  return {
    restrict: "EA",
    templateUrl: "common/directives/shareButton/shareButton.html",
    replace: true,
    scope: {
      item: '='
    },
    link: function (scope, element, attrs) {
      scope.$watch('item', function (item, oldValue) {
        if(item) {
          var tweet_text, unprocessed_tweet_text, parent;
          if ('fundraiser' in item) {
            parent = item.fundraiser;
            unprocessed_tweet_text = "I just pledged "+$filter('dollars')(item.amount)+" to "+parent.title+"!";
          } else if ('issue' in item && item.type === 'Bounty') {
            parent = item.issue;
            unprocessed_tweet_text = "I just posted a "+$filter('dollars')(item.amount)+" bounty on Bountysource!";
          } else if (item.type === 'Proposal') {
            parent = item.issue;
            unprocessed_tweet_text = "I just accepted a proposal from " + item.person.display_name + "!";
          } else {
            parent = item.team;
            unprocessed_tweet_text = "I just pledged "+$filter('dollars')(item.amount)+" to "+parent.name+"!";
          }
          scope.tweet_text = encodeURIComponent(unprocessed_tweet_text);

          var unprocessed_tweet_url = "https://www.bountysource.com"+buildFrontendPath(parent);
          scope.tweet_url = encodeURIComponent(unprocessed_tweet_url);
        }
      });

      // create share url
      function createUrlforItem (item) {
        if ('fundraiser' in item) {
          return createShareUrls(item, item.fundraiser, "fundraiser");
        //if item has issue key, its a bounty
        } else if ('issue' in item) {
          return createShareUrls(item, item.issue, "issue");
        } else {
          return createShareUrls(item, item.team, "team");
        }
      }

      function buildFrontendPath (parent_obj) {
        // to handle team_payins. Teams don't have FE path attribute
        return parent_obj.frontend_path || "/teams/"+parent_obj.slug;
      }

      function createShareUrls (item, parent, item_type) {
        //set the tweet text based upon the item type
        var unprocessed_google_url = "https://www.bountysource.com"+buildFrontendPath(parent);
        var google_url = "https://plus.google.com/share?url="+ encodeURIComponent(unprocessed_google_url);

        var unprocessed_facebook_url = "https://www.bountysource.com"+buildFrontendPath(parent);
        var facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(unprocessed_facebook_url);

        return {
          facebook_url: facebook_url,
          google_url: google_url
        };
      }

       // allows share windows to open
      scope.openFacebook = function (item) {
        var urlObject = createUrlforItem(item);
        var left = screen.width/2 - 300;
        var top = screen.height/2 - 300;
        $window.open(urlObject.facebook_url, "Facebook", 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600,top='+top+', left='+left);
        return false;
      };

      scope.openGooglePlus = function (item) {
        var urlObject = createUrlforItem(item);
        var left = screen.width/2 - 300;
        var top = screen.height/2 - 300;
        $window.open(urlObject.google_url, "Google+", 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600,top='+top+', left='+left);
        return false;
      };
    }
  };
});
