with (scope()) {

  define('chatroom', function() {
    var chatroom_div = div({ id: 'chatroom' });

    var default_nick = function() {
      return get('person') ? get('person').display_name : ('Guest' + Math.floor(Math.random()*99999));
    };

    var chatroom_connect = function(form_data) {
      render({ into: chatroom_div }, iframe({
        src: 'http://localhost:12345/?nick=' + (form_data.nick || default_nick()),
        style: 'display: none',
        onLoad: function() { console.log(this); show(this); }
      }));
    };

    render({ into: chatroom_div },
      div({ 'class': 'connect' },
        p({ style: 'text-align: center; padding-top: 10px' }, "The #Bountysource IRC Chatroom is a place to communicate with other Bountysource users."),

        form({ style: 'text-align: center; padding-top: 10px', action: chatroom_connect },
          span("Nickname:"),
          text({ 'class': 'input-text input-medium', name: 'nick', style: 'margin: 0 10px', placeholder: default_nick }),
          submit({ 'class': 'btn btn-success' }, "Connect")
        )
      )
    );

    return chatroom_div;
  });

  define('chatroom_dropup', function() {
    var chatroom_li = li({ 'class': 'dropdown dropup' });

    var chatroom_toggle = function() {
      toggle_class(document.body, 'chatroom');
      toggle_class(chatroom_li, 'active');
    };

    render({ into: chatroom_li }, a({ href: chatroom_toggle, 'class': 'dropdown-toggle' }, 'Chatroom ', b({ 'class': "caret" })));

    return chatroom_li;
  });

}