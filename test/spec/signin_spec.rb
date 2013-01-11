require 'spec_helper'

describe "Signin" do
  before(:all) { login_with_github! }

  after(:each) do
    @browser.execute_scopejs_script "BountySource.logout();"
  end

  it "should sign in with github from home page" do
    # click github login button on home page
    @browser.goto_route '#'
    @browser.a(class: 'btn-auth btn-github large hover').wait_until_present
    @browser.a(class: 'btn-auth btn-github large hover').click

    @browser.h1(text: 'The funding platform for open-source software.').wait_until_present
    @browser.div(id: 'user-nav').wait_until_present
  end

  it "should signin with github through #signin page" do
    # click github login button on #signin page
    @browser.goto_route '#signin'
    @browser.a(class: 'btn-auth btn-github large hover').wait_until_present
    @browser.a(class: 'btn-auth btn-github large hover').click

    # after login, make sure there is a user nav, ensuring login was successful
    @browser.h1(text: 'The funding platform for open-source software.').wait_until_present
    @browser.div(id: 'user-nav').wait_until_present
  end

  it "should signin with email" do
    # click email login button on home page
    @browser.goto_route '#'
    @browser.a(class: 'btn-auth btn-email large').wait_until_present
    @browser.a(class: 'btn-auth btn-email large').click
    @browser.url.should =~ /#signin$/

    # login with email and password
    @browser.input(id: 'login-email').wait_until_present
    @browser.input(name: 'email').send_keys     "qa@bountysource.com"
    @browser.input(name: 'password').send_keys  "badger42"
    @browser.button(value: 'Sign In').click

    # after login, make sure there is a user nav, ensuring login was successful
    @browser.h1(text: 'The funding platform for open-source software.').wait_until_present
    @browser.div(id: 'user-nav').wait_until_present
  end
end