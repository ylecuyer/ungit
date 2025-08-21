RSpec.describe '[BRANCH]' do
  it 'can create a branch' do
    g = init_repo_with_one_file
    visit_git_repo

    find('[data-aid="create-branch-or-tag-btn"]').click
    find('[data-aid="new-branch-or-tag-name"]').set('new-branch')
    expect {
      find('[data-aid="create-branch-btn"]').click
      expect(page).to have_content('new-branch')
    }.to change { g.branches.count }.by(1)

    expect(g.branches.map(&:name)).to eq(['master', 'new-branch'])
  end

  it 'can delete a branch' do
    g = init_repo_with_one_file
    visit_git_repo

    g.branch('new-branch').create

    expect(page).to have_content('new-branch')

    expect {
        find('[data-aid="branch"]', text: 'new-branch').click
        find('[data-ta-action="delete"]').click
        expect(page).to have_content("Are you sure?")
        find('[data-ta-action="yes"]').click
        expect(page).to have_no_content('new-branch')
    }.to change { g.branches.count }.by(-1)

    expect(g.branches.map(&:name)).to eq(['master'])
  end
end