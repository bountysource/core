# == Schema Information
#
# Table name: tracker_plugins
#
#  id                    :integer          not null, primary key
#  tracker_id            :integer          not null
#  modify_title          :boolean          default(FALSE), not null
#  add_label             :boolean          default(FALSE), not null
#  modify_body           :boolean          default(FALSE), not null
#  synced_at             :datetime
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  label_name            :string(255)      default("bounty"), not null
#  type                  :string(255)
#  person_id             :integer
#  bounties_accepted_msg :string(255)
#  bounty_available_msg  :string(255)
#  bounty_claimed_msg    :string(255)
#  label_color           :string(255)      default("#129e5e"), not null
#  locked                :boolean          default(FALSE), not null
#  last_error            :text
#  locked_at             :datetime
#
# Indexes
#
#  index_tracker_plugins_on_add_label   (add_label)
#  index_tracker_plugins_on_person_id   (person_id)
#  index_tracker_plugins_on_synced_at   (synced_at)
#  index_tracker_plugins_on_tracker_id  (tracker_id) UNIQUE
#

require 'spec_helper'

describe TrackerPlugin::GH do
  let(:person) { create(:person) }
  let!(:linked_account) { create(:github_account, person: person) }
  let(:tracker) { create(:tracker) }

  it "should create plugin" do
    expect {
      person.tracker_plugins.create(tracker: tracker)
    }.to change(person.tracker_plugins, :count).by 1
  end

  context "with plugin" do
    let!(:plugin) { create(:github_plugin, person: person, tracker: tracker) }

    it "should have linked account through person" do
      expect(plugin.linked_account).to eq(linked_account)
    end

    it "should not create two plugins for one tracker" do
      expect {
        person.tracker_plugins.create(tracker: tracker)
      }.not_to change(TrackerPlugin, :count)
    end

    it "should raise if locked and trying to push update" do
      plugin.locked = true
      expect {
        plugin.send(:update_remote_issue!, 1, { body: "", title: "" })
      }.to raise_error
    end
  end

  # NOTE: tracker plugin works radically different... these tests don't correspond at all to current code
  # describe "updating issues" do
  #   let(:tracker) { create(:tracker) }
  #   let(:issue) { create(:github_issue, tracker: tracker, can_add_bounty: false, bounty_total: 100) }
  #   let(:plugin) { create(:github_plugin, tracker: tracker, person: person) }
  #
  #   it "should lock plugin if GitHub API response lacks public_repo permission on issue update" do
  #     Github::API.should_receive(:call) do
  #       OpenStruct.new(success: false, scopes: [])
  #     end
  #
  #     expect {
  #       begin
  #         plugin.send(:update_remote_issue!, issue, {})
  #       rescue TrackerPlugin::GH::IssueUpdateFailed
  #         # We expect this to be raised
  #       end
  #     }.to change(plugin, :locked).to true
  #   end
  #
  #   it "should not push update if body didn't change" do
  #     body = "# hahahahaha content!\r\ndope!"
  #
  #     plugin.should_receive(:fetch_remote_issue).once { OpenStruct.new(success?: true, scopes: ["public_repo"], data: { "body" => body, "title" => "such issue wow" }) }
  #     plugin.should_receive(:build_updated_issue_body).once { body }
  #     plugin.should_receive(:build_updated_issue_title).once
  #     plugin.should_not_receive(:update_remote_issue!) {}
  #
  #     plugin.update_issue_text(issue)
  #   end
  #
  #   it "should push update if body changes" do
  #     body = "# hahahahaha content!\r\ndope!"
  #     updated_body = "#{body}\r\nsuch additional content"
  #
  #     plugin.should_receive(:fetch_remote_issue).once { OpenStruct.new(success?: true, scopes: ["public_repo"], data: { "body" => body, "title" => "such issue wow" }) }
  #     plugin.should_receive(:build_updated_issue_body).once { updated_body }
  #     plugin.should_receive(:build_updated_issue_title).once
  #     plugin.should_receive(:update_remote_issue!).with(issue, { body: updated_body })
  #
  #     plugin.update_issue_text(issue)
  #   end
  #
  #   it "should push update if title changes" do
  #     title = "such issue wow"
  #     updated_title = "such issue wow [$100]"
  #
  #     plugin.should_receive(:fetch_remote_issue).once { OpenStruct.new(success?: true, scopes: ["public_repo"], data: { "body" => "## Shibe\r\n\r\nSuch body wow", "title" => title }) }
  #     plugin.should_receive(:build_updated_issue_body).once
  #     plugin.should_receive(:build_updated_issue_title).once { updated_title }
  #     plugin.should_receive(:update_remote_issue!).with(issue, { title: updated_title })
  #
  #     plugin.update_issue_text(issue)
  #   end
  #
  #   it "should push update if both title and body change" do
  #     title = "such issue wow"
  #     updated_title = "such issue wow [$100]"
  #
  #     body = "## Shibe\r\n\r\nSuch body wow"
  #     updated_body = "## Shibe\r\n\r\nSuch body wow\r\n * shibe best\r\n * wow doge"
  #
  #     plugin.should_receive(:fetch_remote_issue).once { OpenStruct.new(success?: true, scopes: ["public_repo"], data: { "body" => body, "title" => title }) }
  #     plugin.should_receive(:build_updated_issue_body).once { updated_body }
  #     plugin.should_receive(:build_updated_issue_title).once { updated_title }
  #     plugin.should_receive(:update_remote_issue!).with(issue, { body: updated_body, title: updated_title })
  #
  #     plugin.update_issue_text(issue)
  #   end
  #
  #   describe "add bounty to title" do
  #     before { issue.can_add_bounty = true }
  #
  #     describe "modify_title enabled" do
  #       before { plugin.modify_title = true }
  #
  #       it "should add bounty to title" do
  #         issue.bounty_total = 100
  #         title = "Such shibe"
  #         updated_title = plugin.send(:build_updated_issue_title, title, issue)
  #
  #         updated_title.should == "#{title} [#{number_to_currency(issue.bounty_total, precision: 0)}]"
  #       end
  #
  #       it "should not change title if no bounty" do
  #         issue.bounty_total = 0
  #         title = "Such shibe"
  #         updated_title = plugin.send(:build_updated_issue_title, title, issue)
  #
  #         updated_title.should == title
  #       end
  #
  #       # potential edge case, where bounty increases before we update our cache,
  #       # an echeck clears after the issue is closed, etc.
  #       it "should change title if issue closed" do
  #         issue.can_add_bounty = false
  #         issue.bounty_total = 42
  #         title = "Such shibe"
  #         updated_title = plugin.send(:build_updated_issue_title, title, issue)
  #
  #         updated_title.should == "#{title} [#{number_to_currency(issue.bounty_total, precision: 0)}]"
  #       end
  #
  #       it "should remove bounty from title" do
  #         plugin.modify_title = false
  #         issue.bounty_total = 1337
  #         title = "Such shibe wow [#{number_to_currency(issue.bounty_total, precision: 0)}]"
  #         updated_title = plugin.send(:build_updated_issue_title, title, issue)
  #
  #         updated_title.should be == "Such shibe wow"
  #       end
  #     end
  #
  #     describe "modify_title disabled" do
  #       before { plugin.modify_title = false }
  #
  #       it "should not add bounty to title" do
  #         issue.bounty_total = 123456
  #         title = "Such shibe"
  #         updated_title = plugin.send(:build_updated_issue_title, title, issue)
  #         updated_title.should be == title
  #       end
  #
  #       it "should remove bounty from title" do
  #         title = "Such shibe wow [#{number_to_currency(issue.bounty_total, precision: 0)}]"
  #         updated_title = plugin.send(:build_updated_issue_title, title, issue)
  #         updated_title.should be == "Such shibe wow"
  #       end
  #     end
  #   end
  #
  #   describe "with modify_body enabled" do
  #     before { plugin.modify_body = true }
  #
  #     it "should add bountysource block if not present" do
  #       body = "## My pristine body"
  #       updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #       plugin.class.body_pristine?(body).should be_truthy
  #       plugin.class.body_pristine?(updated_body).should be_falsey
  #     end
  #
  #     it "should remove bountysource block if present, and modify_body? is disabled" do
  #       plugin.modify_body = false
  #
  #       body = "## My pristine body\r\n\r\n#{plugin.class::BLOCK_ELEMENT % "content inserted by us"}"
  #       updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #       plugin.class.body_pristine?(body).should be_falsey
  #       plugin.class.body_pristine?(updated_body).should be_truthy
  #     end
  #
  #     describe "with modify_all enabled" do
  #       let(:issue) { create(:github_issue, tracker: tracker) }
  #
  #       before { plugin.modify_all = true }
  #
  #       it "should add message to body if issue still open" do
  #         issue.can_add_bounty = true
  #
  #         body = "## My pristine body"
  #         updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #         plugin.class.body_pristine?(updated_body).should be_falsey
  #       end
  #
  #       it "should remove message when modify all is disabled again" do
  #         issue.can_add_bounty = true
  #         plugin.modify_all = false
  #
  #         body = "## My pristine body IS RUINED\r\n#{plugin.class::BLOCK_ELEMENT % "content inserted by us"}"
  #         updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #         plugin.class.body_pristine?(body).should be_falsey
  #         plugin.class.body_pristine?(updated_body).should be_truthy
  #       end
  #
  #       it "should add bounty available message if issue open with bounty" do
  #         issue.can_add_bounty = true
  #         issue.bounty_total = 100
  #
  #         body = "## My pristine body"
  #         updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #         plugin.class.body_pristine?(updated_body).should be_falsey
  #       end
  #     end
  #
  #     describe "with modify_all disabled" do
  #       before do
  #         plugin.modify_all = false
  #         issue.can_add_bounty = true
  #         issue.bounty_total = 0
  #       end
  #
  #       it "should not add to body if pristine and issue open with no bounty" do
  #         body = "## My pristine body"
  #         updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #         plugin.class.body_pristine?(body).should be_truthy
  #         plugin.class.body_pristine?(updated_body).should be_truthy
  #       end
  #
  #       it "should remove blocks from body if present as a fail-safe" do
  #         body = "## My pristine body IS RUINED\r\n#{plugin.class::BLOCK_ELEMENT % "content inserted by us"}"
  #         updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #         plugin.class.body_pristine?(body).should be_falsey
  #         plugin.class.body_pristine?(updated_body).should be_truthy
  #       end
  #     end
  #   end
  #
  #   describe "with modify_body disabled" do
  #     before { plugin.modify_body = false }
  #
  #     it "should not add bountysource" do
  #       body = "## My pristine body"
  #       updated_body = plugin.send(:build_updated_issue_body, body, issue)
  #
  #       plugin.class.body_pristine?(body).should be_truthy
  #       plugin.class.body_pristine?(updated_body).should be_truthy
  #     end
  #   end
  #
  #   describe "adding/removing labels" do
  #     describe "with add_label enabled" do
  #       before { plugin.add_label = true }
  #
  #       it "should create label if missing from repo" do
  #         plugin.should_receive(:fetch_labels) { [] }
  #         plugin.should_receive(:create_label).with(plugin.label_name, color: plugin.label_color[1..-1])
  #         plugin.should_not_receive(:update_label)
  #         plugin.should_receive(:add_label_to_issue).with(issue, plugin.label_name)
  #
  #         plugin.update_issue_labels(issue)
  #       end
  #
  #       it "should update label if it exists and the color changed" do
  #         plugin.label_color = "#eeeeee"
  #
  #         plugin.should_receive(:fetch_labels) { [{ "name" => plugin.label_name, "color" => "ffffff" }] }
  #         plugin.should_not_receive(:create_label)
  #         plugin.should_receive(:update_label).with(plugin.label_name, color: plugin.label_color[1..-1])
  #         plugin.should_receive(:add_label_to_issue).with(issue, plugin.label_name)
  #
  #         plugin.update_issue_labels(issue)
  #       end
  #
  #       it "should not update label if it exists and hasn't changed" do
  #         plugin.should_receive(:fetch_labels) { [{ "name" => plugin.label_name, "color" => plugin.label_color[1..-1] }] }
  #         plugin.should_not_receive(:create_label)
  #         plugin.should_not_receive(:update_label)
  #         plugin.should_receive(:add_label_to_issue).with(issue, plugin.label_name)
  #
  #         plugin.update_issue_labels(issue)
  #       end
  #     end
  #
  #     describe "with add_label disabled" do
  #       before { plugin.add_label = false }
  #
  #       it "should not remove label from issue or repo" do
  #         plugin.should_not_receive(:remove_label_from_issue)
  #         plugin.should_not_receive(:remove_label)
  #         plugin.update_issue_labels(issue)
  #       end
  #     end
  #   end
  #
  #   describe "backups" do
  #     it "should create backup if body changed" do
  #       expect {
  #         body = "# hahahahaha content!\r\ndope!"
  #         updated_body = "#{body}\r\nsuch additional content"
  #
  #         plugin.should_receive(:fetch_remote_issue).once { OpenStruct.new(success?: true, scopes: ["public_repo"], data: { "body" => body, "title" => "such issue wow" }) }
  #         plugin.should_receive(:build_updated_issue_body).once { updated_body }
  #         plugin.should_receive(:build_updated_issue_title).once
  #         plugin.should_receive(:update_remote_issue!).with(issue, { body: updated_body })
  #
  #         plugin.update_issue_text(issue)
  #       }.to change(plugin.backups, :count).by 1
  #     end
  #   end
  # end
end
