'use strict';

angular.module('app')
  .controller('Navbar', function ($scope, $api) {
    $scope.setEnv = $api.setEnvironment;

    $scope.set_access_token = {
      show_modal: false,
      new_token: $api.get_access_token(),
      open: function() { this.show_modal = true; },
      close: function() { this.show_modal = false; },
      save: function() {
        $api.set_access_token(this.new_token);
        $api.load_current_person_from_cookies();
        this.close();
      }
    };
  })

  .controller('NavbarLinkedAccountSignin', function($scope, $location, $api) {
    $scope.save_route = function() {
      $api.set_post_auth_url($location.url());
    };
  });

/* code to fix issue: https://www.bountysource.com/issues/467715-all-external-links-should-open-in-a-new-tab */
function setupExternalLinks(){
  var allLinks = document.getElementsByTagName('a');
  for(var i = 0; i < allLinks.length; i++){
    if(allLinks[i].href.indexOf('http://') === 0 && allLinks[i].href.indexOf('https://www.bountysource.com') !== 0 && allLinks[i].href.indexOf('http://www.bountysource.com') !== 0){
        allLinks[i].target = '_blank';
    }
  }
}

setupExternalLinks();
