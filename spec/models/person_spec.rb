# == Schema Information
#
# Table name: people
#
#  id                   :integer          not null, primary key
#  first_name           :string(255)
#  last_name            :string(255)
#  display_name         :string(255)
#  email                :string(255)      not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  buyer_id             :string(255)
#  password_digest      :string(255)
#  account_completed    :boolean          default(FALSE)
#  paypal_email         :string(255)
#  last_seen_at         :datetime
#  last_bulk_mailed_at  :datetime
#  admin                :boolean          default(FALSE)
#  bio                  :text
#  location             :string(255)
#  url                  :string(255)
#  company              :string(255)
#  public_email         :string(255)
#  accepted_terms_at    :datetime
#  cloudinary_id        :string(255)
#  deleted              :boolean          default(FALSE), not null
#  profile_completed    :boolean          default(FALSE), not null
#  shopping_cart_id     :integer
#  stripe_customer_id   :string(255)
#  suspended_at         :datetime
#  bounty_hunter        :boolean
#  quickbooks_vendor_id :integer
#
# Indexes
#
#  index_people_on_email             (email) UNIQUE
#  index_people_on_shopping_cart_id  (shopping_cart_id)
#

require 'spec_helper'

describe Person do
  let(:person) { create(:person) }
  let(:backer) { create(:backer) }

  describe "frontend URLs" do
    # TODO
  end

  it "has a valid factory" do
    person.should be_valid
    person.backer?.should be_falsey
    backer.backer?.should be_truthy
  end

  describe "display_name" do
    it "should manufacture from first+last" do
      person = Person.new(
        first_name: 'Amy',
        last_name: 'Winter',
        email: 'amy@winter.com',
        password: 'abcd1234',
        password_confirmation: 'abcd1234'
      )
      person.should be_valid
      person.display_name.should == 'Amy Winter'

      person = Person.new(first_name: 'Amy', last_name: 'Winter', display_name: '', email: 'amy2@winter.com',
                          password: 'abcd1234', password_confirmation: 'abcd1234')
      person.should be_valid
      person.display_name.should == 'Amy Winter'

      person = Person.new(display_name: 'Amy Winter', email: 'amy3@winter.com',
                          password: 'abcd1234', password_confirmation: 'abcd1234')
      person.should be_valid
      person.display_name.should == 'Amy Winter'
      person.first_name.should == 'Amy'
      person.last_name.should == 'Winter'
    end
  end

  it "should return an access token" do
    expect(person.create_access_token).to_not be_nil
  end

  it "should create a hash for access token" do
    expect(AccessToken.send(:hash_access_token, person.id, Time.now.to_i)).to_not be_nil
  end

  describe "access tokens" do
    it "should be of the format '<person id>.<time>.<hashed token>'" do
      token = person.create_access_token
      expect(token).not_to be_nil
      expect(token).to match(/#{person.id}\.\d+\.\w+/)
    end

    it "should have a hashed token that matches Person::hash_auth_token(<person>, <time>)" do
      token = person.create_access_token
      time, hash = token.split('.').last(2)
      expect(hash).not_to be_empty
      expect(hash).to eq(AccessToken.send(:hash_access_token, person.id, time))
    end
  end

  describe "finding people" do
    it "should return a person given a valid access token" do
      expect(Person.find_by_access_token(person.create_access_token)).to eq(person)
    end

    it "should not return a person given an invalid access token" do
      expect(Person.find_by_access_token("not_valid")).to be_nil
    end

    describe "with expired access tokens" do
      let(:expired_time) { 1.year.ago.to_i }
      let(:expired_access_token) do
        token = "#{person.id}.#{expired_time}.#{AccessToken.send(:hash_access_token, person.id, expired_time)}"
        access_token = person.access_tokens.create
        access_token.token = token
        access_token.save
        token
      end

      it "should not return a person" do
        expect(AccessToken.find_by_token(expired_access_token).still_valid?).to be_falsey
        expect(Person.find_by_access_token(expired_access_token)).to be_nil
      end

      it "should still have valid person id and hash" do
        expect(expired_access_token).to match(/#{person.id}\.#{expired_time}\.#{AccessToken.send(:hash_access_token, person.id, expired_time)}/)
      end
    end
  end

  describe "authentication" do
    it "should find the person by email and password" do
      person.should == Person.authenticate(person.email, person.password)
    end
  end

  describe "#get_ranked_issues" do
    let!(:issue) { create :issue }
    let(:issue_rank_cache) { create :issue_rank_cache, issue: issue, person: person, rank: 3}
    let(:low_issue_rank_cache) { create :issue_rank_cache, issue: issue, person: person, rank: 2}

    it "should return ranked issues for a person with a high enough rank" do
      issue_rank_cache
      issues = person.get_ranked_issues
      issues.count.should eq(1)
    end

    it "should not return an issue if the rank isn't high enough" do
      low_issue_rank_cache
      issues = person.get_ranked_issues
      issues.count.should eq(0)
    end
  end

  describe "#issues_from_ranked_trackers" do
    let!(:tracker) { create :tracker }
    let!(:issue) { create :issue, tracker: tracker }
    let(:tracker_rank_cache) { create :tracker_rank_cache, tracker: tracker, rank: 4, person: person }

    it "should return issues from a ranked tracker" do
      tracker_rank_cache
      issues = person.issues_from_ranked_trackers
      issues.count.should eq(1)
    end
  end

  describe "languages" do
    let(:person) { create(:person) }
    let!(:language1) { create(:language, name: 'some') }
    let!(:language2) { create(:language, name: 'thing') }
    let!(:language3) { create(:language, name: 'stack') }

    it "should add languages" do
      person.set_languages(language1.id, language2.id, language3.id)
      person.reload
      person.languages.should include language1
      person.languages.should include language2
      person.languages.should include language3
    end

    it "should not delete language_relations" do
      person.set_languages(language1.id, language2.id)
      person.reload.language_relations.count.should be == 2

      person.set_languages(language1.id)
      person.reload.language_relations.where(language_id: language2.id).should_not be_empty
    end

    it "should mark language relation as inactive on remove" do
      person.set_languages(language1.id)
      relation = person.language_relations.last
      relation.should be_active

      person.set_languages()
      person.reload

      relation = person.language_relations.last
      relation.should_not be_active
      person.languages.should_not include language1
    end
  end

end
