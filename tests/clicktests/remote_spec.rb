RSpec.describe '[REMOTE]' do
  it 'can add a remote' do |example|
    g = init_repo_with_one_file
    visit_git_repo

    expect(page).to have_content('No remotes specified')

    find('[data-aid="remote-dropdown-menu-trigger"]').click
    find('[data-aid="add-remote"]').click

    fill_in 'Name', with: 'origin'
    fill_in 'Url', with: "file://#{example.metadata[:remote_dir]}"

    expect {
      find('[data-aid="form-modal-submit"]').click
      expect(page).to have_content('Fetch from origin')
    }.to change { g.remotes.count }.by(1)

    expect(g.remotes.first.name).to eq('origin')
    expect(g.remotes.first.url).to eq("file://#{example.metadata[:remote_dir]}")
  end

  it 'can remove a remote' do |example|
    g = init_repo_with_one_file
    g.add_remote('origin', "file://#{example.metadata[:remote_dir]}")
    visit_git_repo

    expect(page).to have_content('Fetch from origin')

    find('[data-aid="remote-dropdown-menu-trigger"]').click
    find('[data-ta-clickable="origin-remove"]').click

    expect {
      find('[data-ta-action="yes"]').click
      expect(find('[data-aid="fetch-button"]:disabled'))
    }.to change { g.remotes.count }.by(-1)

    expect(g.remotes.count).to eq(0)
  end
end
