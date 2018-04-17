class Mailer < ActionMailer::Base
  default from: %(Bountysource <support@bountysource.com>)

  layout 'email'

  include NumberToDollarsHelper
  helper :number_to_dollars, :owner_link, :tracker_link, :issue_link, :team_link

  # override mail() so we can wire in unsubscribes
  def mail(headers={}, &block)
    # TODO: always send to support@bountysource.com and feedback@bountysource.com
    # TODO: never send to qa+?@bountysource.com or null-#@bountysource.com

    # doesn't actually do anything, sorry!
    faux_mailer = OpenStruct.new(deliver: nil)

    if @unsubscribe_category
      # check if they unsubscribed? (checks person, linked_accounts, emails, etc).
      categories = ['all', @unsubscribe_category]
      categories << 'bounty_alerts' if @unsubscribe_category['bounty_alerts']
      categories << 'team_updates' if @unsubscribe_category['team_updates']
      return faux_mailer if Unsubscribe.d?(headers[:to], categories)

      url = "#{Api::Application.config.www_url}notifications/unsubscribe"
      params = {
        email: @unsubscribe_token,
        type: @unsubscribe_category
      }
      @unsubscribe_link = "#{url}?#{params.to_param}"
    end

    # add a prefix to the email in dev/qa mode
    headers[:subject] = "[#{ENV['SMTP_SUBJECT_PREFIX']}] #{headers[:subject]}" unless ENV['SMTP_SUBJECT_PREFIX'].blank?

    # do we really send an email?
    if ENV['SMTP_WHITELIST'].blank? || ENV['SMTP_WHITELIST'].split(',').include?(headers[:to])
      super headers, &block
    else
      Rails.logger.debug "MOCK EMAIL: #{headers[:to]} -- #{headers[:subject]}"
      return faux_mailer
    end
  end

  def member_accepted_proposal(options)
    # Todo: Create alert for all admins/devs that a proposal was accepted on an issue?
  end

  def proposal_created_to_team(options)
    @proposal = options.fetch(:proposal)
    @person = options.fetch(:person)

    mail(to: @person.email, subject: %(A proposal has been submitted for "#{@proposal.issue.title}")) do |format|
      format.text
      format.html
    end
  end

  def proposal_appointed(options)
    @proposal = options[:proposal]
    @person = options[:person]

    mail(to: @person.email, subject: 'Your proposal has been accepted') do |format|
      format.text
      format.html
    end
  end

  def proposal_rejected(options)
    @proposal = options[:proposal]
    @person = options[:person]

    mail(to: @person.email, subject: 'Your proposal has been rejected') do |format|
      format.text
      format.html
    end
  end

  def proposal_appointed_to_team(options)
    @proposal = options[:proposal]
    @person = options[:person]

    mail(to: @person.email, subject: %(A proposal was accepted for "#{@proposal.issue.title}")) do |format|
      format.text
      format.html
    end
  end

  def proposal_rejected_to_team(options)
    @proposal = options[:proposal]
    @person = options[:person]

    mail(to: @person.email, subject: %(A proposal was rejected for "#{@proposal.issue.title}")) do |format|
      format.text
      format.html
    end
  end

  def bounty_created(options)
    @person = options[:person]
    @bounty = options[:bounty]

    mail(to: @person.email, subject: "Bounty created!") do |format|
      format.text
      format.html
    end
  end

  def bounty_placed(options)
    @person = options[:person]
    @bounty = options[:bounty]

    @unsubscribe_token = Unsubscribe.object_to_token(@person)
    @unsubscribe_category = "bounty_alerts_tracker_#{@bounty.issue.tracker.id}"

    # Special tracker params
    @issue_analytics_params = { utm_campaign: "alerts", utm_source: "bounty", utm_medium: "email", utm_content: "tracker/#{@bounty.issue.tracker.id}" }

    mail(to: @person.email, from: %(Bountysource Alerts <alerts@bountysource.com>), subject: "Bounty posted for #{@bounty.issue.title} on #{@bounty.issue.tracker.name}")
  end

  def repository_donation_made(options)
    @person = options[:person]
    @repo = options[:repo]
    @amount = options[:amount] # View requires this to be a Money object

    mail(to: @person.email, subject: "Thank you for your donation to #{@repo.name}!") do |format|
      format.text
      format.html
    end
  end

  def account_created(options)
    @person = options[:person]

    github_account = LinkedAccount::Github.find_by(person_id: @person.id).present?
    @show_github_plugin_block = @person.present? && github_account.present? && @person.projects.count > 0

    mail(to: @person.email, subject: "Welcome to Bountysource!") do |format|
      format.text
      format.html
    end
  end

  def reset_password(options)
    @person = options[:person]
    @token = options[:token]

    mail(to: @person.email, subject: "Reset your password") do |format|
      format.text
      format.html
    end
  end

  def email_verification(options)
    @person = options[:person]
    @token = options[:token]

    mail(to: @person.email, subject: "Verify your email") do |format|
      format.text
      format.html
    end
  end

  def change_email(options)
    @person = options[:person]
    @token = options[:token]

    mail(to: @person.email, subject: "Verify email change") do |format|
      format.text
      format.html
    end
  end

  def fundraiser_pledge_made(options)
    @person = options[:person]
    @pledge = options[:pledge]

    mail(to: @person.email, subject: "Pledge made to #{@pledge.fundraiser.title}") do |format|
      format.text
      format.html
    end
  end

  def welcome_back(options)
    @person = options[:person]
    @utm = options[:utm]

    headers "X-SMTPAPI" => {
      filters: {
        clicktrack: { settings: { enable: 0 } },
        opentrack: { settings: { enable: 0 } }
      }
    }.to_json

    mail(from: %("Warren Konkel" <support@bountysource.com>), to: @person.email, subject: "Relaunching Bountysource, the funding platform for open-source software!") do |format|
      format.text { render :layout => false }
      format.html { render :layout => false }
    end
  end

  def bounty_refunded(options)
    @person = options[:person]
    @bounty = options[:bounty]

    mail(to: @person.email, subject: "Bounty refunded") do |format|
      format.text
      format.html
    end
  end

  def bounty_refunded_for_deleted_issue(options)
    @person = options[:person]
    @bounty = options[:bounty]

    mail(to: @person.email, subject: "Bounty refunded") do |format|
      format.text
      format.html
    end
  end

  def team_payin_refunded(options)
    @person = options[:person]
    @team_payin = options[:team_payin]

    mail(to: @person.email, subject: "Your contribution to #{@team_payin.team.name} has been refunded")
  end

  def fundraiser_featured_notification(options)
    @person = options[:person]
    @fundraiser = options[:fundraiser]
    mail(to: @person.email, subject: "Fundraiser #{@fundraiser.title} is now FEATURED") do |format|
      format.text
      format.html
    end
  end

  def pledge_survey_email(options)
    @person = options[:person]
    @pledge = options[:pledge]
    @reward = options[:reward]
    @fundraiser = options[:fundraiser]
    mail(to: @person.email, subject: "ACTION NEEDED: Funding goal reached for #{@fundraiser.title}") do |format|
      format.text
      format.html
    end
  end

  def fundraiser_backed(options)
    @person = options[:person]
    @pledge = options[:pledge]
    @fundraiser = @pledge.fundraiser

    mail(to: @person.email, subject: "#{@pledge.owner_display_name capitalize: true} backed your fundraiser #{@fundraiser.title}") do |format|
      format.text
      format.html
    end
  end

  def notify_creator_of_fundraiser_breached(options)
    @person = options[:person]
    @fundraiser = options[:fundraiser]
    mail(to: @person.email, subject: "#{@fundraiser.title} has completed its funding goal!") do |format|
      format.text
      format.html
    end
  end

  def notify_backers_of_fundraiser_breached(options)
    @person = options[:person]
    @fundraiser = options[:fundraiser]
    mail(to: @person.email, subject: "#{@fundraiser.title} has completed its funding goal!") do |format|
      format.text
      format.html
    end
  end

  def notify_creator_of_fundraiser_half_completion(options)
    @person = options[:person]
    @fundraiser = options[:fundraiser]
    mail(to: @person.email, subject: "#{@fundraiser.title} is 50% funded") do |format|
      format.text
      format.html
    end
  end

  def notify_backers_of_fundraiser_half_completion(options)
    @person = options[:person]
    @fundraiser = options[:fundraiser]
    mail(to: @person.email, subject: "#{@fundraiser.title} is 50% funded") do |format|
      format.text
      format.html
    end
  end

  def team_update_created(options)
    @recipient = options[:person] || options[:linked_account]
    @update = options[:update]

    @unsubscribe_token = Unsubscribe.object_to_token(@recipient)
    @unsubscribe_category = "team_updates_#{@update.team.id}"
    @team_url = "https://www.bountysource.com/teams/#{@update.team.slug}"
    @team_name = @update.team.name
    @team_thanks = "[The #{@team_name} Team](#{@team_url})"

    # if linked account, show github explanation
    if options[:linked_account]
      stargazer_relation = case
        when options[:stargazer_relations].blank? then "a follower"
        when options[:stargazer_relations].length == 1 then options[:stargazer_relations].first
        when options[:stargazer_relations].length == 2 then options[:stargazer_relations].join(' and ')
        when options[:stargazer_relations].length > 2 then options[:stargazer_relations][0..-2].join(', ') + ', and ' + options[:stargazer_relations].last
      end
      @header_markdown = "*`[ You are receiving this email from `[`#{@team_name}`](#{@team_url})` because you are #{stargazer_relation} on GitHub. ]`*"
    end

    headers["X-SMTPAPI"] = {
      category: ['team_updates', "team_update-#{@update.team.slug}-#{@update.number}"],
      # filters: {
      #   clicktrack: { settings: { enable: 0 } },
      #   opentrack: { settings: { enable: 0 } }
      # }
    }.to_json

    # Note: excluding text version of email, since the update is formatted with markdown
    mail_attrs = {}
    mail_attrs[:to] = @recipient.email
    mail_attrs[:from] = %(#{@update.team.name} <updates+#{@update.team.slug}@bountysource.com>)
    mail_attrs[:subject] = "#{@update.team.name} Update ##{@update.number || @update.next_number}: #{@update.title}"

    if options[:is_draft]
      mail_attrs[:subject] = "[DRAFT] #{mail_attrs[:subject]}"
      mail_attrs[:bcc] = 'updates@bountysource.com'
    end

    mail(mail_attrs)
  end

  def bounty_increased(options)
    @person = options[:person]
    @bounty = options[:bounty]

    @unsubscribe_token = Unsubscribe.object_to_token(@person)
    @unsubscribe_category = "bounty_alerts_tracker_#{@bounty.issue.tracker.id}"

    @issue_analytics_params = { utm_campaign: "alerts", utm_source: "bounty", utm_medium: "email", utm_content: "tracker/#{@bounty.issue.tracker.id}" }

    mail(to: @person.email, from: %(Bountysource Alerts <alerts@bountysource.com>), subject: %(Bounty increased for "#{@bounty.issue.title}" on "#{@bounty.issue.tracker.name}"))
  end

  def fundraiser_completed(options)
    @person     = options[:person]
    @fundraiser = options[:fundraiser]

    mail(to: @person.email, subject: "Fundraiser completed! #{@fundraiser.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_accepted_backer_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty claimed for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_accepted_developer_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]
    @responses = options[:responses]

    mail(to: @person.email, subject: "Bounty claimed for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_contested_backer_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty contested for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_contested_developer_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty contested for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_rejected_backer_notice(options)
    @person = options[:person]
    @response = options[:response]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty claim rejected for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_rejected_developer_notice(options)
    @person = options[:person]
    @response = options[:response]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty claim rejected for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_rejected_rejecter_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty claim rejected for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_submitted_backer_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty claim submitted for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def remind_unresponsive_backers_of_bounty_claim(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]
    @time_period = options[:time_period] || "Not much"

    mail(to: @person.email, subject: "#{@time_period} remaining to respond to #{@bounty_claim.person.display_name}'s' bounty claim") do |format|
      format.text
      format.html
    end
  end

  def bounty_claim_submitted_developer_notice(options)
    @person = options[:person]
    @bounty_claim = options[:bounty_claim]

    mail(to: @person.email, subject: "Bounty claim submitted for #{@bounty_claim.issue.title}") do |format|
      format.text
      format.html
    end
  end

  def added_to_team(options)
    @person = options[:person]
    @team = options[:team]

    mail(to: @person.email, subject: "You were added as a member of #{@team.name}") do |format|
      format.text
      format.html
    end
  end

  def claim_team(options)
    @person = options[:person]
    @team = options[:team]
    mail(to: @person.email, subject: "You are now the admin of #{@team.name}")
  end

  def claim_team_rejected(options)
    @person = options[:person]
    @team = options[:team]
    @team_claim = options[:team_claim]
    mail(to: @person.email, subject: "Your team claim for #{@team.name} was rejected")
  end

  def team_member_added(options)
    @person = options[:person]
    @invitee = options[:invitee]
    @team = options[:team]

    mail(to: @person.email, subject: "#{@invitee.display_name} has been added as a member of #{@team.name}") do |format|
      format.text
      format.html
    end
  end

  def team_member_requested_invite(options)
    @person = options[:person]
    @invitee = options[:invitee]
    @team = options[:team]

    mail(to: @person.email, subject: "#{@invitee.display_name} wants to join #{@team.name}") do |format|
      format.text
      format.html
    end
  end

  def team_permissions_changed(options)
    @person = options[:person]
    @member_relation = options[:member_relation]
    @team = options[:team]
    @admin = options[:admin]

    mail(to: @person.email, subject: "#{@admin.display_name} updated your permissions for #{@team.name}") do |format|
      format.text
      format.html
    end
  end

  def team_member_permissions_changed(options)
    @person = options[:person]
    @member_relation = options[:member_relation]
    @team = options[:team]
    @admin = options[:admin]
    @member = options[:member]

    mail(to: @person.email, subject: "#{@admin.display_name} changed the permissions for #{@member_relation.person.display_name}") do |format|
      format.text
      format.html
    end
  end

  def team_account_funded_admin(options)
    @team_payin = options[:team_payin]
    @backer = @team_payin.person
    @person = options[:person] #person receiving the email
    @team = @team_payin.team
    mail(to: @person.email, subject: "#{@team_payin.person.display_name} contributed #{number_to_dollars(@team_payin.amount)} to #{@team.name}") do |format|
      format.text
      format.html
    end
  end

  def team_account_funded_backer(options)
    @team_payin = options[:team_payin]
    @person = options[:person]
    @team = @team_payin.team
    mail(to: @person.email, subject: "You contributed #{number_to_dollars(@team_payin.amount)} to #{@team.name}") do |format|
      format.text
      format.html
    end
  end

  #Isn't used anywhere. Preserving for now.
  def team_account_funded(options)
    @person = options[:person]
    @admin = options[:admin]
    @amount = options[:amount]
    @team = options[:team]

    mail(to: @person.email, subject: "Funds added to #{@team.name} account") do |format|
      format.text
      format.html
    end
  end

  def invited_to_team(options)
    @invite = options[:invite]

    mail(to: options[:email], subject: "You have been invited to join #{@invite.team.name} on Bountysource") do |format|
      format.text
      format.html
    end
  end

  def notify_backers_of_developer_goal_set(options)
    @person = options[:person]
    @developer_goal = options[:developer_goal]

    mail(to: @person.email, subject: %(A developer has set a funding target on "#{@developer_goal.issue.title}")) do |format|
      format.text
      format.html
    end
  end


  def developer_goal_reached(options)
    @person = options[:person]
    @developer_goal = options[:developer_goal]

    mail(to: @person.email, subject: %(Your bounty goal has been met on "#{@developer_goal.issue.title}") ) do |format|
      format.text
      format.html
    end
  end

  def notify_stakeholders_of_developer_work_started(options)
    @person = options[:person]
    @solution = options[:solution]

    mail(to: @person.email, subject: %(A developer has started work on "#{@solution.issue.title}")) do |format|
      format.text
      format.html
    end
  end

  def notify_stakeholders_of_developer_work_stopped(options)
    @person = options[:person]
    @solution = options[:solution]

    mail(to: @person.email, subject: %(A developer has stopped working on "#{@solution.issue.title}")) do |format|
      format.text
      format.html
    end
  end

  def extension_feedback(options)
    @person = options[:person]
    @email = options[:email]
    @message = options[:message]
    mail(to: "feedback@bountysource.com", subject: "Extension Feedback") do |format|
      format.text
      format.html
    end
  end

  # def newsletter(options)
  #   @person = options[:person]
  #
  #   @unsubscribe_link = "#{Api::Application.config.www_url}notifications/unsubscribe?#{{email: @person.email, type: 'newsletters'}.to_param}"
  #
  #   # SCRIPT TO EMAIL EVERYBODY
  #   # Person.active.includes(:email_preference).find_each do |person|
  #   #   next unless person.receive_email_newsletters?
  #   #   person.delay(priority: 150).deliver_email(:newsletter)
  #   #   puts person.id
  #   # end
  #
  #   headers["X-SMTPAPI"] = {
  #     category: ['newsletter', 'newsletter-2015-08-20'],
  #     # filters: {
  #     #   clicktrack: { settings: { enable: 0 } },
  #     #   opentrack: { settings: { enable: 0 } }
  #     # }
  #   }.to_json
  #
  #   mail(to: @person.email, from: %(Bountysource <newsletter@bountysource.com>), subject: %(Featured Projects: Crystal Language, NW.js, and Ruby Object Manager)) do |format|
  #     format.text
  #     format.html
  #   end
  # end

  def unsubscribed(options)
    @person = options[:person]
    @email_type = options[:email_type]

    mail(to: @person.email, from: %(Bountysource <newsletter@bountysource.com>), subject: %(You have been unsubscribed from #{@email_type} emails)) do |format|
      format.text
      format.html
    end
  end

  def order_created(options)
    @person = options[:person]
    @shopping_cart = options[:person].shopping_carts.where(id: options[:shopping_cart_id]).first!
    @transaction = @shopping_cart.order
    @payment_notification = @shopping_cart.payment_method.notifications.where(id: options[:payment_notification_id]).first! if options[:payment_notification_id]

    mail(to: @person.email, subject: %(Receipt for Order ##{options[:shopping_cart_id]})) do |format|
      format.text
      format.html
    end
  end

  def order_failed(options)
    @person = options[:person]
    @shopping_cart = options[:person].shopping_carts.where(id: options[:shopping_cart_id]).first!
    @payment_notification = @shopping_cart.payment_method.notifications.where(id: options[:payment_notification_id]).first!

    mail(to: @person.email, subject: %(Problem with Order ##{options[:shopping_cart_id]})) do |format|
      format.text
      format.html
    end
  end

  def issue_suggestion_created(options)
    @person = options[:person]
    @issue_suggestion = options[:issue_suggestion]

    subject = "Issue Suggestion for #{@issue_suggestion.team.name}"
    subject += ": #{@issue_suggestion.issue.sanitized_title}" unless @issue_suggestion.issue.empty_title?
    mail(to: @person.email, subject: subject) do |format|
      format.text
      format.html
    end
  end

  def issue_suggestion_thanked(options)
    @person = options[:person]
    @issue_suggestion = options[:issue_suggestion]
    @thanked_reward = options[:thanked_reward]

    subject = "You have been thanked by #{@issue_suggestion.team.name}"
    subject += ": #{@issue_suggestion.issue.sanitized_title}" unless @issue_suggestion.issue.empty_title?

    mail(to: @person.email, subject: subject) do |format|
      format.text
      format.html
    end
  end

  def issue_suggestion_rejected(options)
    @person = options[:person]
    @issue_suggestion = options[:issue_suggestion]

    subject = "Your issue suggestion has been rejected by #{@issue_suggestion.team.name}"
    subject += ": #{@issue_suggestion.issue.sanitized_title}" unless @issue_suggestion.issue.empty_title?

    mail(to: @person.email, subject: subject) do |format|
      format.text
      format.html
    end
  end

  def cash_out_payment_sent(options)
    @cash_out = options[:cash_out]
    @person = options[:person]
    mail(to: @person.email, subject: 'Your cash out has been processed')
  end

end
