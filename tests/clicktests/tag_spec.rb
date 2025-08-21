RSpec.describe '[TAG]' do
  it 'can create a tag' do
    g = init_repo_with_one_file
    visit_git_repo

    find('[data-aid="create-branch-or-tag-btn"]').click
    find('[data-aid="new-branch-or-tag-name"]').set('new-tag')
    expect {
      find('[data-aid="create-tag-btn"]').click
      expect(page).to have_content('new-tag')
    }.to change { g.tags.count }.by(1)

    expect(g.tags.map(&:name)).to eq(['new-tag'])
  end

  it 'can delete a tag' do
    g = init_repo_with_one_file
    visit_git_repo

    g.add_tag('new-tag')

    expect(page).to have_content('new-tag')

    expect {
      find('[data-aid="tag"]', text: 'new-tag').click
      find('[data-ta-action="delete"]').click
      expect(page).to have_content("Are you sure?")
      find('[data-ta-action="yes"]').click
      expect(page).to have_no_content('new-tag')
    }.to change { g.tags.count }.by(-1)

    expect(g.tags.map(&:name)).to eq([])
  end
end