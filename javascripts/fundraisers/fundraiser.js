with (scope('Fundraiser', 'App')) {
  define('status_element', function(fundraiser) {
    var element = a({ 'class': 'status-indicator', href: fundraiser.frontend_path });
    if (fundraiser.published) {
      if (fundraiser.in_progress) {
        element.innerHTML = 'Published';
        add_class(element, 'green');
      } else {
        element.innerHTML = 'Closed';
        add_class(element, 'red');
      }
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
      return;
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
