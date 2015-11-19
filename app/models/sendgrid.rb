class Sendgrid

  def self.list_name
    Rails.env.production? ? 'Synced' : 'Synced-QA'
  end

  def self.sync
    raise "DOESNT WORK WITH NEW EmailPreference MODEL"

    results = { removed: 0, inserted: 0 }

    #puts "Updating unsubscribed_at"
    api("api/unsubscribes.get.json", date: 1).each do |hash|
      email = hash['email']
      if person = Person.find_by_email(email)
        person.update_attributes(unsubscribed_at: Time.parse(hash['created'])) # unless person.unsubscribed_at
      else
        #puts "Email not found: #{email}"
      end
    end

    # removing unsubs
    current_unsubscribed_emails = Person.where('unsubscribed_at is not null').pluck(:email)
    current_unsubscribed_emails.in_groups_of(1000, false) do |emails|
      response = api("api/newsletter/lists/email/delete.json", list: Sendgrid.list_name, email: emails)
      results[:removed] += response['removed']
    end

    # adding rest
    current_unsubscribed_emails = Person.where('unsubscribed_at is null')
    current_unsubscribed_emails.in_groups_of(1000, false) do |people|
      response = api("api/newsletter/lists/email/add.json", list: Sendgrid.list_name, data: people.map { |p| { email: p.email, name: p.display_name, display_name: p.display_name }.to_json })
      results[:inserted] += response['inserted']
    end

    results
  end

  def self.api(url, params)
    params = {
      api_user: Api::Application.config.action_mailer.smtp_settings[:user_name],
      api_key: Api::Application.config.action_mailer.smtp_settings[:password]
    }.merge(params)

    body = HTTParty.post(File.join("https://sendgrid.com/", url), body: params, timeout: 5).body
    #puts "RESPONSE: #{body.inspect}"
    JSON.parse(body)
  end
end
