# == Schema Information
#
# Table name: merged_models
#
#  id         :integer          not null, primary key
#  good_id    :integer          not null
#  bad_id     :integer          not null
#  bad_type   :string           not null
#  created_at :datetime         not null
#
# Indexes
#
#  index_merged_models_on_bad_id_and_bad_type  (bad_id,bad_type) UNIQUE
#

require 'spec_helper'

describe MergedModel do

  let(:bad_model) { create(:tracker) }
  let(:good_model) { create(:tracker) }

  let(:action) do
    lambda { |a,b| a.merge! b }
  end

  it 'should delete bad model' do
    expect {
      action[good_model, bad_model]
      bad_model.reload
    }.to raise_error ActiveRecord::RecordNotFound
  end

  it 'should create merged model' do
    expect {
      action[good_model, bad_model]
    }.to change(MergedModel, :count).by 1
  end

  it 'should find good model through merged model' do
    action[good_model, bad_model]

    found_model = bad_model.class.find_with_merge bad_model.id
    expect(found_model).to eq(good_model)
  end

  it 'should find good model through chained merged models' do
    gooder_model = create(:tracker)
    goodest_model = create(:tracker)

    action[good_model, bad_model]
    action[gooder_model, good_model]
    action[goodest_model, gooder_model]

    found_model = bad_model.class.find_with_merge bad_model.id
    expect(found_model).to eq(goodest_model)
  end

end
