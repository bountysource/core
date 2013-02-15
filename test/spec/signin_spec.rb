require 'spec_helper'

describe "Signin" do
  it "should authenticate with email/password" do
    @browser.goto '#signin/email'

    form = @browser.section(id: 'content').form
    form.text_field(name: 'email').set(CREDENTIALS["bountysource"]['email'])
    form.text_field(name: 'password').set(CREDENTIALS["bountysource"]['password'])
    form.div(text: /Email address found/).wait_until_present
    form.button.click

    @browser.span(id: 'user_nav_name').wait_until_present
  end

  it "should show password reset link when email/password are wrong" do
    @browser.goto '#signin/email'

    form = @browser.section(id: 'content').form
    form.text_field(name: 'email').set(CREDENTIALS["bountysource"]['email'])
    form.text_field(name: 'password').set('wrong-password')
    form.div(text: /Email address found/).wait_until_present
    form.button.click

    @browser.a(text: /reset your password via email/).wait_until_present
  end

  it "should reset password with code" do

  end

  it "should create an account with email/password, enter optional fields, log out and log back in" do
    tmp_email = CREDENTIALS["bountysource"]['email'].gsub('@', "+#{Time.now.to_f}@")
    tmp_pass = CREDENTIALS["bountysource"]['password']

    # fill in first form
    @browser.goto '#signin/email'
    form = @browser.section(id: 'content').form
    form.text_field(name: 'email').set(tmp_email)
    form.text_field(name: 'password').set(tmp_pass)
    form.div(text: /Email address not yet registered/).wait_until_present
    form.text_field(name: 'first_name').set('John')
    form.text_field(name: 'last_name').set('Doe')
    form.text_field(name: 'display_name').set('john.doe')
    form.button.click

    # wait until we're logged in
    @browser.span(id: 'user_nav_name', text: 'john.doe').wait_until_present

    # logout
    @browser.span(id: 'user_nav_name').hover
    @browser.a(text: 'Logout').click
    @browser.a(text: 'Sign In').wait_until_present

    # log back in
    @browser.goto '#signin/email'
    form = @browser.section(id: 'content').form
    form.text_field(name: 'email').when_present.set(tmp_email)
    form.text_field(name: 'password').set(tmp_pass)
    @browser.div(text: /Email address found/).wait_until_present
    form.button.click

    # wait until we're logged in
    @browser.span(id: 'user_nav_name', text: 'john.doe').wait_until_present
  end

  it "should link with github and create a new account" do
    @browser.goto '#'
    @browser.a(text: 'Sign In').when_present.click
    @browser.a(text: 'GitHub').click
    @browser.span(id: 'user_nav_name', text: CREDENTIALS["github"]["username"]).wait_until_present
  end
end


