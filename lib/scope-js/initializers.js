with (scope()) {
  scope.__initializers = [];

  define('initializer', function(callback) {
    scope.__initializers.push(callback);
  });
  
  // setup browser hook
  window.onload = function() {
    for (var i=0; i < scope.__initializers.length; i++) scope.__initializers[i]();
    delete scope.__initializers;
  }
}