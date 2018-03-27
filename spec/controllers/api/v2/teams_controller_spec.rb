require 'spec_helper'

describe Api::V2::TeamsController do
  render_views

  # TODO replace with include_context for v2 controllers
  let(:params) do
    {
      vendor_string: 'bountysource'
    }
  end

  describe 'index' do
    let(:team) { create(:team) }

    it 'should be ok' do
      get :index, params: params
      expect(response.status).to eq(200)
    end
  end

  describe 'show' do
    let(:team) { create(:team) }

    before do
      params.merge!(id: team.slug)
    end

    it 'should be ok' do
      get :show, params: params
      expect(response.status).to eq(200)
    end
  end

end
