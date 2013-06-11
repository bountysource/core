with (scope('Bountysource')) {

  define('api_path', 'https://api.bountysource.com/');

  define('attribute', function() {
    console.log("ATTRIBUTE: ", arguments);
  });
}