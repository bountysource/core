with (scope()) {

  route('#', function() {
    render(
      div({ 'class': "alert alert-success text-center", style: 'color: #333' },
        h2("The funding platform for open-source software."),
        p({ 'class': 'lead' }, "Use bounties and fundraisers to improve the open-source projects you love!"),
        p(a({ href: '#about', 'class': 'btn btn-success' }, 'Learn how it works'))
      ),

      div({ 'class': 'row-fluid homepage' },
        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/38d0de99945b4ed4b7cf1a3b5ab40625.png' })),
            div({ 'class': 'content' },
              h2('Farwest'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          div({ 'class': "alert alert-info", style: 'color: #333' },
            a({ href: '#issues/123'}, 'Some issue ($50000)'),br(),
            a({ href: '#trackers/123'}, 'Some tracker ($50000)'),br(),
            a({ href: '#fundraisers/123'}, 'Some fundraiser ($50000)')
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        ),

        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/651178082af3e23f5fe09b216253c938.png' })),
            div({ 'class': 'content' },
              h2('Kivy on Raspberry Pi'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus."),
          p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        ),

        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/1f3b49934d2f6557fc93c77e24ac2e20.png' })),
            div({ 'class': 'content' },
              h2('Farwest'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus."),
          p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        ),

        div({ 'class': 'span3' },
          div({ 'class': "well card", style: 'color: #333' },
            div({ 'class': 'image' }, img({ src: 'https://c10078377.ssl.cf2.rackcdn.com/ce1194dd6eb19069cf034f962810a94a.png' })),
            div({ 'class': 'content' },
              h2('Farwest'),
              p('by lhoguin'),
              p('Farwest allows front-end developers to write Erlang-powered applications without having to write any Erlang code.'),
              p('$125 pledged'),
              p('88days left')
            )
          ),
          p("lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus."),
          p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec ipsum dui, non placerat nulla. Phasellus et tortor tortor, ut sagittis eros. Vestibulum molestie dictum neque, non volutpat nisi blandit et. Sed eu aliquam lorem. Ut a orci ante, at varius elit. Pellentesque et lorem a quam volutpat tristique. In semper ultricies mauris, a gravida lacus egestas a. Suspendisse posuere egestas quam iaculis ullamcorper. Vestibulum eget molestie metus.")
        )
      )
    );
  });

}