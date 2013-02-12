require 'spec_helper'

describe "Fundraiser Creation" do

  before(:all) do
    @fundraiser = OpenStruct.new(
      title:              'My awesome fundraiser',
      short_description:  'Look at my horse, my horse is amazing',
      homepage_url:       'https://www.bountysource.com',
      repo_url:           'https://github.com/bountysource/frontend',
      funding_goal:       100,
      days_open:          42
    )
  end

  after(:all) do
    # delete the fundraiser
  end

  it "should see the create fundraiser button" do
    login_with_email!

    @browser.goto '#'
    @browser.a(text: 'Create Fundraiser').wait_until_present
  end

  it "should create a new fundraiser and land on the edit page" do
    login_with_email!

    @browser.goto '#account/create_fundraiser'
    @browser.text_field(name: 'title').when_present.send_keys @fundraiser.title
    @browser.button(text: 'Create Fundraiser').click

    @browser.ul(id: 'fundraiser-nav-bar').wait_until_present
  end

  it "should see edit button on fundraiser show page" do
    login_with_email!

    @browser.goto '#account/fundraisers'
    @browser.table.wait_until_present
    @browser.as(text: @fundraiser.title).first.click # goto fundraiser show page

    @browser.span(text: /edit/i).wait_until_present
  end

  describe "with newly created fundraiser" do
    before do
      login_with_email!

      # goto fundraiser page
      @browser.goto '#account/fundraisers'
      @browser.a(text: @fundraiser.title).wait_until_present
      @browser.as(text: @fundraiser.title).last.click

      # click the edit button
      @browser.span(text: /edit/i).when_present.click

      # wait until on the edit page
      @browser.ul(id: 'fundraiser-nav-bar').wait_until_present
    end

    it "should fill in basic info" do
      # the correct nav button should be displayed
      nav_element = @browser.ul(id: 'fundraiser-nav-bar').a(id: 'basic-info')
      nav_element.attribute_value('class').should match /\bactive\b/

      # the title should already be filled in
      @browser.text_field(name: 'title').value.should == @fundraiser.title

      # fill in the banner image URL with a random image pulled from the page
      @fundraiser.image_url = @browser.imgs.to_a.sample.src
      @browser.text_field(name: 'image_url').set @fundraiser.image_url, :tab

      # fill in the homepage URL
      @browser.text_field(name: 'homepage_url').set @fundraiser.homepage_url, :tab

      # fill in the repo URL
      @browser.text_field(name: 'repo_url').set @fundraiser.repo_url, :tab

      # fill in the short description, then blur out
      @browser.text_field(name: 'short_description').set @fundraiser.short_description, :tab

      # the card preview should update with the short description and the preview should have updated data
      @browser.div(id: 'fundraiser-card-preview').div(text: @fundraiser.short_description).when_present.click

      # check for title
      @browser.text.should match /\b#{@fundraiser.title}/

      # check for short description
      @browser.text.should match /\b#{@fundraiser.short_description}/

      # check for homepage link
      @browser.text.should match /\b#{@fundraiser.homepage_url}/

      # check for repo link
      @browser.text.should match /\b#{@fundraiser.repo_url}/
    end

    it "should fill in description" do
      @browser.ul(id: 'fundraiser-nav-bar').a(id: 'description').click

      # the correct nav button should be displayed
      nav_element = @browser.ul(id: 'fundraiser-nav-bar').a(id: 'description').when_present
      nav_element.attribute_value('class').should match /\bactive\b/

      # set that description, homie. set @fundraiser.description to description element value
      description_element = @browser.text_field(name: 'description')
      description_element.set(
        "## This is my awesome fundraiser", :enter,
        "Please give me money.", :enter,
        "## FAQs", :enter,
        "> y u so cool?", :enter, :enter,
        "because I feel like it"
      )
      @fundraiser.description = description_element.value

      # goto preview and make sure description is there
      @browser.div(id: 'fundraiser-card-preview').click

      # @browser.breakpoint!

      @browser.p(text: "Please give me money.").wait_until_present
    end

    it "should fill in funding goal" do
      @browser.ul(id: 'fundraiser-nav-bar').a(id: 'funding').click

      # the correct nav button should be displayed
      nav_element = @browser.ul(id: 'fundraiser-nav-bar').a(id: 'funding').when_present
      nav_element.attribute_value('class').should match /\bactive\b/

      @browser.text_field(name: 'funding_goal').set @fundraiser.funding_goal, :tab

      # the fundraiser card preview should have been updated
      @browser.div(id: 'fundraiser-card-preview').span(text: /\$#{@fundraiser.funding_goal}/).wait_until_present

      # goto preview and make sure description is there
      @browser.div(id: 'fundraiser-card-preview').click

      @browser.span(text: /\$#{@funding_goal}/).should be_present
    end

    it "should fill in duration" do
      @browser.ul(id: 'fundraiser-nav-bar').a(id: 'duration').click

      # the correct nav button should be displayed
      nav_element = @browser.ul(id: 'fundraiser-nav-bar').a(id: 'duration').when_present
      nav_element.attribute_value('class').should match /\bactive\b/

      # get the days open input
      days_open_input = @browser.text_field(name: 'days_open')

      # set the desired days open
      days_open_input.set @fundraiser.days_open, :tab

      # make sure the correct number of days remaining is on the preview page
      # goto preview and make sure description is there
      @browser.div(id: 'fundraiser-card-preview').click

      @browser.span(text: /#{@fundraiser.days_open}/).should be_present
    end

    pending "should show publish button if all data present" do

    end

    describe "rewards" do
      before do
        @browser.ul(id: 'fundraiser-nav-bar').a(id: 'rewards').click

        # the correct nav button should be displayed
        nav_element = @browser.ul(id: 'fundraiser-nav-bar').a(id: 'rewards').when_present
        nav_element.attribute_value('class').should match /\bactive\b/

        @create_form = @browser.form(id: 'rewards-create')
      end

      it "should create a reward" do
        @create_form.text_field(name: 'amount').set 10
        @create_form.text_field(name: 'limited_to').set 0
        @create_form.text_field(name: 'description').set "I will sign your chest"
        @create_form.text_field(name: 'fulfillment_details').set "What color would you like?"
        @create_form.button.click

        @browser.li(text: 'I will sign your chest').wait_until_present
      end

      it "should update a reward" do
        @browser.li(text: 'I will sign your chest').click
        @browser.text_field(name: 'description', value: 'I will sign your chest').when_present.set "Just kidding"
        @browser.button(text: 'Save').click
        @browser.li(text: 'Just kidding').wait_until_present
      end

      it "should delete a reward" do
        @browser.li(text: 'Just kidding').click
        @browser.a(text: 'Delete').click
        Watir::Wait.until { !@browser.li(text: 'Just kidding').present? }
      end

      pending "should insert many rewards with different different amounts, sorting them as pending adds them" do

      end

      pending "should receive rewards from API in sorted order" do

      end

      it "should now have a publish button" do
        @browser.a(text: 'Publish').should be_present
      end
    end

    describe "published fundraiser" do
      pending "should be able to update basic info" do
      end

      pending "should be able to update description" do
      end

      pending "should not be able to update funding goal" do
      end

      pending "should not be able to update duration" do
      end

      pending "should not be able to delete" do
      end

      describe "rewards" do
        pending "should be able to update quantpendingy and fulfillment details" do
        end

        pending "should not be able to update description or amount" do
        end

        pending "should not be able to delete" do
        end
      end
    end
  end
end