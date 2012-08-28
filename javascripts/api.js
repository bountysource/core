with (scope('BountySource')) {

  define('api_host', 'https://www.bountysource.com/');

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
    
    JSONP.get(options);
  });
  
  define('search', function(term, callback) {
    api('/search', 'GET', { term: term }, callback);
  });
}