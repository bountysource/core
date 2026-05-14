require 'spec_helper'

describe Api::V2::ReportsController do

  let(:person) { create(:person) }
  let(:issue) { create(:issue) }

  describe 'create' do
    it 'requires authentication' do
      post :create, params: { target_type: 'Issue', target_id: issue.id }
      expect(response.status).to eq(401)
    end

    it 'creates a report when authenticated' do
      post :create, params: {
        access_token: person.access_token,
        target_type: 'Issue',
        target_id: issue.id,
        reason: 'spam'
      }
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['target_type']).to eq('Issue')
      expect(body['target_id']).to eq(issue.id)
      expect(body['reason']).to eq('spam')
      expect(body['status']).to eq('open')
    end

    it 'rejects duplicate reports' do
      Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      post :create, params: {
        access_token: person.access_token,
        target_type: 'Issue',
        target_id: issue.id,
        reason: 'spam'
      }
      expect(response.status).to eq(422)
    end

    it 'requires target_type and target_id' do
      post :create, params: { access_token: person.access_token }
      expect(response.status).to eq(422)
    end
  end

  describe 'index' do
    it 'returns reports list' do
      Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      get :index
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
    end

    it 'filters by status' do
      Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam', status: 'open')
      Report.create!(reporter: person, target_type: 'Issue', target_id: 99999, reason: 'spam', status: 'resolved')
      get :index, params: { status: 'open' }
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
    end
  end

  describe 'show' do
    it 'returns a single report' do
      report = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      get :show, params: { id: report.id }
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['id']).to eq(report.id)
    end
  end

  describe 'update' do
    it 'requires authentication' do
      report = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      patch :update, params: { id: report.id, status: 'resolved' }
      expect(response.status).to eq(401)
    end

    it 'rejects non-admin users' do
      report = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      patch :update, params: { id: report.id, access_token: person.access_token, status: 'resolved' }
      expect(response.status).to eq(401)
    end

    it 'allows admin to update status' do
      admin = create(:person, admin: true)
      report = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      patch :update, params: { id: report.id, access_token: admin.access_token, status: 'resolved' }
      expect(response.status).to eq(200)
      body = JSON.parse(response.body)
      expect(body['status']).to eq('resolved')
    end
  end
end
