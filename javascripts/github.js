with (scope('Github')) {
  define('auth_button', function() {
    var access_token = Storage.get('access_token');

    if (access_token) {
      return a({ href: BountySource.logout }, 'Logout of GitHub');
    } else {
      return a({ href: BountySource.api_host + 'auth/github?redirect_url=' + document.location.href }, 'Login via GitHub');
    }
  });
}