require 'spec_helper'

describe BadgeController do
  render_views

  let(:svg) { '<doge />' }
  before { allow_any_instance_of(Badge::Base).to receive(:shield_svg).and_return(svg) }

  describe 'issue' do
    let(:issue) { create(:issue) }

    it 'should render badge' do
      get :issue, params: { issue_id: issue.id }
      expect(response.body).to eq(svg)
      expect(response.status).to eq(200)
    end

    describe 'errors' do
      describe 'record not found' do
        it 'should render error' do
          get :issue, params: { issue_id: 'noooope' }
          expect(response.status).to eq(404)
        end
      end

      describe 'missing id' do
        it 'should render error' do
          get :issue
          expect(response.status).to eq(422)
        end
      end
    end
  end

  describe 'tracker' do
    let(:tracker) { create(:tracker) }

    it 'should render badge' do
      get :tracker, params: { tracker_id: tracker.id }
      expect(response.body).to eq(svg)
      expect(response.status).to eq(200)
    end

    describe 'errors' do
      describe 'record not found' do
        it 'should render error' do
          get :tracker, params: { tracker_id: 'noooope' }
          expect(response.status).to eq(404)
        end
      end

      describe 'missing id' do
        it 'should render error' do
          get :tracker
          expect(response.status).to eq(422)
        end
      end
    end
  end

  describe 'team' do
    let(:team) { create(:team) }
    let(:params) { { team_id: team.id } }

    shared_examples_for 'a valid team badge request' do
      it 'should render badge' do
        get :team, params: params
        expect(response.body).to eq(svg)
        expect(response.status).to eq(200)
      end
    end

    describe 'bounties posted' do
      before { params.merge!(style: 'bounties_posted') }
      it_behaves_like 'a valid team badge request'
    end

    describe 'bounties received' do
      before { params.merge!(style: 'bounties_received') }
      it_behaves_like 'a valid team badge request'
    end

    describe 'money raised' do
      before { params.merge!(style: 'raised') }
      it_behaves_like 'a valid team badge request'
    end

    describe 'errors' do

      describe 'record not found' do

        it "record not found" do
          badge_factory = double()
          allow(badge_factory).to receive(:team).and_raise(ActiveRecord::RecordNotFound)
          allow(BadgeFactory).to receive(:new).and_return(badge_factory)

          get :team, params: params
          expect(response.status).to eq(404)
        end
      end

      describe 'Key error' do
        it "should raise" do
          badge_factory = double()
          allow(badge_factory).to receive(:team).and_raise(KeyError)
          allow(BadgeFactory).to receive(:new).and_return(badge_factory)

          get :team, params: params
          expect(response.status).to eq(422)
        end
      end

      describe 'parse error' do
        it "should raise" do
          badge_factory = double()
          allow(badge_factory).to receive(:team).and_raise(BadgeFactory::ParseError)
          allow(BadgeFactory).to receive(:new).and_return(badge_factory)

          get :team, params: params
          expect(response.status).to eq(422)
        end
      end
    end
  end

end
