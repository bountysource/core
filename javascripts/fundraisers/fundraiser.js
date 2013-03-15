with (scope('Fundraiser', 'App')) {
  define('get_href', function(fundraiser) {
    return pretty_url('#fundraisers/'+fundraiser.id+'-', fundraiser.title);
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

  define('embed_iframe', function(fundraiser) {
    return iframe({
      src:    BountySource.api_host + 'user/fundraisers/' + fundraiser.id + '/embed',
      style:  'width: 238px; height: 402px; overflow: hidden; border: 0;'
    });
  });
}
