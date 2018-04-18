require 'spec_helper'

describe Api::V2::IssuesController do
  describe 'create' do

    let(:issue) { build(:issue) }
    let(:tracker) { double(:tracker) }

    before do
      allow(Issue).to receive(:find_by_url).and_return(issue)
    end

    describe 'issue exists' do
      it 'should find issue' do
        expect(Issue).not_to receive(:create!)
        post(:create)
        expect(response.status).to eq(200)
      end
    end

    describe 'issue does not exist' do
      before do
        allow(Tracker).to receive(:find_by_url).and_return(tracker)
        allow(Issue).to receive(:find_by_url).and_return(nil)
        allow(tracker).to receive_message_chain(:issues, :create!).and_return(issue)
      end

      it 'should create issue' do
        post(:create)
        expect(response.status).to eq(201)
      end

      it 'should render error on invalid issue create' do
        allow(Issue).to receive(:find_by_url).and_return(nil)
        allow(tracker).to receive_message_chain(:issues, :create!).and_raise(ActiveRecord::RecordInvalid.new build(:issue))
        post(:create)
        expect(response.status).to eq(422)
      end

      describe 'tracker exists' do
        it 'should find existing tracker' do
          expect(Tracker).to receive(:find_by_url).and_return(tracker).once
          post(:create)
        end

        it 'should not create tracker' do
          expect(Tracker).not_to receive(:create!)
          post(:create)
        end
      end

      describe 'tracker does not exist' do
        before do
          allow(Tracker).to receive(:find_by_url).and_return(nil)
        end

        it 'should create tracker' do
          expect(Tracker).to receive(:create!).and_return(tracker).once
          post(:create)
        end

        it 'should render error on invalid tracker create' do
          expect(Tracker).to receive(:create!).and_raise(ActiveRecord::RecordInvalid.new build(:issue)).once
          post(:create)
          expect(response.status).to eq(422)
        end
      end
    end
  end
end