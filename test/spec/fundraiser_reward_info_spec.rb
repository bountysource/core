require 'spec_helper'

describe "Fundraiser Reward Info" do
  let(:fundraiser) do
    OpenStruct.new(
      title:              'My awesome fundraiser',
      short_description:  'Look at my horse, my horse is amazing',
      homepage_url:       'https://www.bountysource.com',
      repo_url:           'https://github.com/bountysource/frontend',
      funding_goal:       100,
      days_open:          42,
      id: 1
    )
  end

  describe "info btn" do
    let(:fundraiser_pledges_data) do
      {
        title: "My awesome fundraiser",
        rewards: [
          {
            "description"=>"Reward #1",
            "limited_to"=>5,
            "amount"=>10,
            "claimed"=>1,
            "sold_out"=>false,
            "fulfillment_details"=>nil,
            "pledges"=>[
              {
                "id"=>35,
                "amount"=>"10.0",
                "created_at"=>"2013-03-04T04:01:17Z",
                "person"=>{
                  "id"=>688, "first_name"=>"John", "last_name"=>"Doe",
                  "display_name"=>"John Doe",
                  "avatar_url"=>"https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png",
                  "created_at"=>"2013-03-04T04:01:17Z", "profile_url"=>"#users/688-john-doe"
                }
              }
            ]
          },
          {
            "description"=>"Reward #2",
            "limited_to"=>5,
            "amount"=>10,
            "claimed"=>3,
            "sold_out"=>false,
            "fulfillment_details"=>nil,
            "pledges"=>[
              {
                "id"=>36,
                "amount"=>"10.0",
                "created_at"=>"2013-03-04T04:01:17Z",
                "person"=>{
                  "id"=>689, "first_name"=>"John", "last_name"=>"Smith",
                  "display_name"=>"John Smith",
                  "avatar_url"=>"https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png",
                  "created_at"=>"2013-03-04T04:01:17Z", "profile_url"=>"#users/688-john-doe"
                }
              }
            ]
          }
        ]
      }
    end

    let(:method_to_override) { "get_fundraiser_pledges_overview" }

    before do
      login_with_email!
      @browser.goto '#account/fundraisers'
      @browser.link(text: fundraiser.title).wait_until_present
      link = @browser.links(text: fundraiser.title).last
      @browser.goto link.attribute_value('href') # goto fundraiser show page
      @browser.override_api_response_data(method_to_override, data: fundraiser_pledges_data, success: true)
      @browser.span(text: /info/i).when_present.click
    end

    after do
      @browser.restore_api_method(method_to_override)
    end
    it "should show a fundraiser reward info" do
      @browser.div(text: "Reward #1").wait_until_present
      @browser.text.should match(/Claimed: 1/)
      @browser.text.should match(/John Doe/)

      @browser.text.should match(/Reward #2/)
      @browser.text.should match(/Claimed: 3/)
      @browser.text.should match(/John Smith/)
    end
  end

  describe "receipt page" do
    let(:pledge_id) { 1 }
    let(:method_to_override) { "get_pledge" }
    let(:fundraiser_data) {
      {
        title:              'My awesome fundraiser',
        short_description:  'Look at my horse, my horse is amazing',
        homepage_url:       'https://www.bountysource.com',
        repo_url:           'https://github.com/bountysource/frontend',
        funding_goal:       100,
        days_open:          42,
        id: 1,
        funding_goal_reached: funding_goal_data
      }
    }

    let(:fundraiser_pledge_data) do
      {
        fundraiser: fundraiser_data,
        reward: {
          "description"=>"Reward #1",
          "limited_to"=>5,
          "amount"=>10,
          "claimed"=>1,
          "sold_out"=>false,
          "fulfillment_details"=>"must be present"
        },
        amount: 99
      }
    end

    before do
      login_with_email!
      @browser.override_api_response_data(method_to_override, data: fundraiser_pledge_data, success: true)
      @browser.goto "#fundraisers/#{fundraiser.id}/pledges/#{pledge_id}/survey"
      @browser.h3(text: fundraiser.title).wait_until_present
    end

    after do
      @browser.restore_api_method(method_to_override)
    end

    describe "funding goal reached" do
      let(:funding_goal_data) { true }
      it "should show redeem reward form" do
        @browser.input(value: "Redeem reward").wait_until_present
      end
    end

    describe "funding goal not reached" do
      let(:funding_goal_data) { false }
      it "should not show redeem reward form" do
        @browser.text.should_not match(/must be present/)
      end
    end
  end
end