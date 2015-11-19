angular.module('app').config(function($cookieJarProvider) {
  $cookieJarProvider.setDefaultOptions({
    path: '/',
    expires: Infinity,
    secure: 'auto'
  });
});
