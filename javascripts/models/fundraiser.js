with (scope('Fundraiser', 'Bountysource')) {

  attribute('title', 'description');

  has_many('pledges');

  define('find', function(id) {
    return {
      title: 'I want to raise all the monies.',
      description: "So awesome!!!"
    };

    JSONP.get({ url: api_path + 'fundraisers/'+id, callback: function(response) {
      console.log(response);
    }});
  });

}
//new Fundraiser({
//  title: "One Thousand and One Nights",
//  author: "Scheherazade"
//});
