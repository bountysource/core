/*jshint unused: false */
/*jshint -W117 */
'use strict';

var fill_form = function (data) {
  for (var key in data) {
    var id = 'form_data.' + key;
    if (typeof(data[key]) === "boolean") {
      input(id).check();
    } else {
      input(id).enter(data[key]);
    }
  }
};

function blurEmailField () {
  using('form[name=form]').element("input[name=email]").query(function(element, done) {
    var evt = document.createEvent("Event");
    evt.initEvent('blur', false, true);
    element[0].dispatchEvent(evt);
    done();
  });
}

angular.scenario.dsl('cookies', function() {
  var chain = {};
  chain.clear = function(name) {
      return this.addFutureAction('clear cookies', function($window, $document, done) {
            var injector = $window.angular.element($window.document.body).inheritedData('$injector');
            var cookies = injector.get('$cookies');
            console.log("Clearing cookie", cookies[name]);
            var root = injector.get('$rootScope');
            delete cookies[name];
            root.$apply(); // forcibly flush the cookie changes
            done();
          });
    };

  return function() {
    return chain;
  };
});

angular.scenario.dsl('google_wallet', function() {
  var chain = {};
  chain.start = function(name) {
      return this.addFutureAction('start google auth', function($window, $document, done) {
            var injector = $window.angular.element($window.document.body).inheritedData('$injector');
            if (window.Mock.getCount() === 0) {
              done(null, "Google wallet called");
            } else {
              done(null, "Google wallet failed");
            }
          });
    };

  return function() {
    return chain;
  };
});

// angular.scenario.dsl('select_row', function() {
//   var chain = {};
//   chain.
// });

function findAndFillFields (formPrefix, mockData) {
  for (var key in mockData) {
    input(formPrefix + "." + key).enter(mockData[key]);
    expect(input(formPrefix + "." + key).val()).toBe(mockData[key]);
  }
}

var MOCK = {
  valid_user: {
    email:    "mr_manly@gmail.com",
    password: "MANLINESS123456"
  },

  valid_user_wrong_pass: {
    email:    "mr_manly@gmail.com",
    password: "wrongpassword1"
  },

  existing_user: {
    email:        "mr_manly@gmail.com",
    password:     "MANLINESS123456",
    first_name:   "Mister",
    last_name:    "ManlyMan",
    display_name: "TheManliest",
    terms:        true
  },

  new_account_valid: {
    email: "sample@test.com",
    password: "password1",
    first_name: "Test",
    last_name: "McTest",
    display_name: "TestMcTest",
    terms: true
  },

  fundraiserPayload: {
    access_token: "2218963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc",
    title: "Fake Fundraiser!",
    short_description: "A little test description",
    funding_goal: "15000",
    image_url: "http://i.imgur.com/CBlzO0B.jpg",
    homepage_url: "http://fakehome.com",
    repo_url: "http://hithub.com",
    description: "Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.",
  },

  fundraiser: {
    title: "Fake Fundraiser!",
    short_description: "A little test description",
    funding_goal: "15000",
    image_url: "http://i.imgur.com/CBlzO0B.jpg",
    homepage_url: "http://fakehome.com",
    repo_url: "http://hithub.com",
    description: "Bacon ipsum dolor sit amet tongue sirloin kielbasa, chicken meatball shoulder shank turducken spare ribs jowl shankle cow pancetta. T-bone tri-tip strip steak short loin shoulder frankfurter, drumstick salami prosciutto. Biltong filet mignon pastrami t-bone sausage jerky ground round boudin shank turkey pig prosciutto chicken bacon capicola. Chuck brisket pig t-bone jerky ground round beef fatback pork bacon flank drumstick venison short ribs.",
  },

  new_reward: {
    amount: "25",
    limited_to: "10",
    description: "A cool t shirt",
    fulfillment_details: "Please email your size!"
  },

  newRewardPayload: {
    access_token: "2218963.1375865344.7bc74c5029793d0fbde2724648d147221bc6cdcc",
    amount: "25",
    limited_to: "10",
    description: "A cool t shirt",
    fulfillment_details: "Please email your size!"
  }

};
