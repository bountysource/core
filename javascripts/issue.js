with (scope('Issue','App')) {
  // get the link for an issue object
  define('get_href', function(issue) {
    return '#/repos/'+issue.repository.full_name+'/issues/'+issue.number;
  });

  // render a pretty 'open' or 'closed' element
  define('status_element', function(issue) {
    return span({ style: 'font-size: 16px;' },
      issue.state == 'open' ? span({ style: 'background: #83d11a; border-radius: 4px; padding: 4px; color: white' }, 'Open') : span({ style: 'background: #D11A1A; border-radius: 4px; padding: 4px; color: white' }, 'Closed')
    );
  });
}