with (scope('Chat', 'App')) {
  define('chat_server', 'https://www-qa.badger.com/chat/bountysource.html');

  define('show_chat', function() {
    var chatbar = document.getElementById('chatbar'),
        footer  = document.getElementsByTagName('footer')[0],
        chatbar_content = document.getElementById('chatbar-content');

    if (chatbar_content.innerHTML.length <= 0) {
      render({ target: 'chatbar-content' }, iframe({ src: chat_server }));
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
        footer  = document.getElementsByTagName('footer')[0],
        chatbar_content = document.getElementById('chatbar-content');;
    chatbar.classList.remove('minimized');
    footer.classList.add('chatbar');
  });
}
