with (scope('Fundraiser', 'App')) {
  define('belongs_to', function(person) {
    return logged_in() && person && parseInt(person.id) == parseInt((Storage.get('access_token')||'').split('.')[0]);
  });

  define('get_href', function(fundraiser) {
    return pretty_url('#fundraisers/'+fundraiser.id+'-', fundraiser.title);
  });

  define('card', function(fundraiser) {
    fundraiser.description = fundraiser.short_description;
    return Home.fundraiser_card(fundraiser);
  });

  define('fundraiser_published_status', function(fundraiser) {
    return span({ style: 'font-size; 16px;' },
      fundraiser.published ? span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Published') : span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Draft')
    );
  });

  define('fundraiser_published_status', function(fundraiser) {
    return span({ style: 'font-size; 16px;' },
      fundraiser.published ? span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Published') : span({ style: 'background: #29A8DD; border-radius: 4px; padding: 4px; color: white' }, 'Draft')
    );
  });
}