// Get data from the query string (before #<scope.js route>)
//
// Example: href is https://www.badger.com?foo=bar#my_route
// > QueryString.get('foo');
//   #=> 'bar'
with (scope('QueryString')) {
  define('get', function(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href.search);
    if(results == null)
      return null;
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  });
}
scope('QS','QueryString'); // alias to QS