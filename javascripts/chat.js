with (scope('Chat', 'App')) {
  define('show_chat', function() {
    var chatbar = document.getElementById('chatbar'),
        footer  = document.getElementsByTagName('footer')[0],
        chatbar_content = document.getElementById('chatbar-content');

    if (chatbar_content.innerHTML.length <= 0) {
      var url = 'https://www.bountysource.com/chat/bountysource.html';
      if (Storage.get('user_info')) {
        var display_name = JSON.parse(scope.instance.Storage.get('user_info')).display_name;
        if (display_name && display_name.length > 0) url = url + '?display_name=' + display_name.replace(/ /g,'');
      }
      render({ target: 'chatbar-content' }, iframe({ src: url }));
      chatbar.classList.remove('minimized');
      chatbar.classList.add('active');
    } else if (chatbar.classList.contains('minimized')) {
      maximize_chat();
    }
    footer.classList.add('chatbar');
  });

  define('hide_chat', function() {
    var chatbar = document.getElementById('chatbar'),
        footer  = document.getElementsByTagName('footer')[0];
    chatbar.classList.add('closed');
    chatbar.classList.remove('active');
    footer.classList.remove('chatbar');
    render({ target: 'chatbar-content' }, '');
  });

  define('minimize_chat', function() {
    var chatbar = document.getElementById('chatbar'),
        footer  = document.getElementsByTagName('footer')[0];
    chatbar.classList.add('minimized');
    footer.classList.remove('chatbar');
  });

  define('maximize_chat', function() {
    var chatbar = document.getElementById('chatbar'),
        footer  = document.getElementsByTagName('footer')[0];
    chatbar.classList.remove('minimized');
    footer.classList.add('chatbar');
  });
}
