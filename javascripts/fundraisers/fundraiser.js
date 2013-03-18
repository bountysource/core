with (scope('Fundraiser', 'App')) {
  define('get_href', function(fundraiser) {
    return pretty_url('#fundraisers/'+fundraiser.id+'-', fundraiser.title);
  });

  define('status_element', function(fundraiser) {
    var element = a({ 'class': 'status-indicator', href: fundraiser.frontend_path });
    if (fundraiser.published) {
      element.innerHTML = 'Published';
      add_class(element, 'green');
    } else {
      element.innerHTML = 'Draft';
      add_class(element, 'blue');
    }
    return element;
  });

  define('pledge_status_element', function(pledge) {
    var element = a({ 'class': 'status-indicator', href: pledge.frontend_path });

    if (pledge.reward && pledge.reward.fulfillment_details && !pledge.survey_response) {
      element.innerHTML = 'Info Needed';
      add_class(element, 'orange');
    } else {
      element.innerHTML = 'Fine and Dandy';
      add_class(element, 'green');
    }

    return element;
  });

  define('embed_iframe', function(fundraiser) {
    return iframe({
      src:    BountySource.api_host + 'user/fundraisers/' + fundraiser.id + '/embed',
      style:  'width: 238px; height: 402px; overflow: hidden; border: 0;'
    });
  });
}
