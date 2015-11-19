RSpec.shared_examples_for 'a request that requires auth' do
  it 'should require person' do
    Api::BaseController.any_instance.stub(:current_user).and_return(nil)
    action
    expect(response.status).to eq(401)
  end
end

RSpec.shared_examples_for 'a request that requires a request for proposal' do
  it 'should require request for proposal' do
    issue.stub(:request_for_proposal).and_return(nil)
    expect(issue).to receive(:request_for_proposal).once
    action
    expect(response.status).to eq(404)
  end
end

RSpec.shared_examples_for 'a request authorized by require_team_admin_or_developer' do
  it 'should require current user to be managing member of team' do
    team.stub(:person_is_admin?).and_return(false)
    team.stub(:person_is_developer?).and_return(false)
    action
    expect(response.status).to eq(401)
  end
end

RSpec.shared_examples_for 'a request authorized by require_proposal_owner' do
  it 'should require person to own proposal' do
    proposal.stub(:person).and_return(double)
    action
    expect(response.status).to eq(401)
  end
end
