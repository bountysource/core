with (scope('Chat', 'App')) {
  define('show_chat', function() {
    var chatbar = document.getElementById('chatbar'),
        footer  = document.getElementsByTagName('footer')[0],
        chatbar_content = document.getElementById('chatbar-content');

    if (chatbar_content.innerHTML.length <= 0) {
      render({ target: 'chatbar-content' }, iframe({ src: 'http://www.badger.com/chat/bountysource.html' }));
      chatbar.classList.remove('closed');
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

//with (Hasher('Chat', 'Application')) {
//
//  define('show_chat', function(callback) {
//    if ($('#chatbar div.content iframe').length == 0) {
//      $('#chatbar div.content').html(iframe({ 'src': '/chat/qui.html' }));
//      $('#chatbar').removeClass('closed');
//      $('#chatbar').addClass('active');
//    } else if ($('#chatbar').hasClass('minimized')) {
//      maximize_chat();
//    }
//    $('#footer').addClass('chatbar');
//  });
//
//  define('hide_chat', function(callback) {
//    $('#chatbar').addClass('closed');
//    $('#chatbar').removeClass('active');
//    $('#footer').removeClass('chatbar');
//    $('#chatbar div.content').html('');
//  });
//
//  define('minimize_chat', function(callback) {
//    $('#chatbar').addClass('minimized');
//    $('#footer').removeClass('chatbar');
//  });
//
//  define('maximize_chat', function(callback) {
//    $('#chatbar').removeClass('minimized');
//    $('#footer').addClass('chatbar');
//  });
//
//}

