with (scope('Issue','App')) {
  // get the link for an issue object
  define('get_href', function(issue) {
    return '#/repos/'+issue.repository.full_name+'/issues/'+issue.number;
  });
}