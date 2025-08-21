RSpec.describe '[COMMIT]' do
  it 'can empty commit' do
    g = init_repo_with_one_file
    visit_git_repo

    expect(page).to have_content("Create an empty commit?")
    find('[data-aid="empty-commit"]').click

    expect(page).to have_content("0 files, 0 to be commited")
    expect(find('[data-aid="stg-commit-title"]').value).to eq('Empty commit')
    expect(find('[data-aid="stg-commit-body"]').value).to eq('')

    expect {
      find('[data-aid="stg-commit-btn"]').click
      expect(page).to have_content("Nothing to commit.")
    }.to change { commits = g.log.execute; commits.count }.by(1)

    last_commit = g.log.execute.first
    expect(last_commit.message).to eq('Empty commit')
  end

  it 'can amend last commit without file changes' do
    g = init_repo_with_one_file
    visit_git_repo

    expect(page).to have_content("Amend previous commit?")
    find('[data-aid="amend-commit"]').click
    expect(page).to have_content("0 files, 0 to be commited")
    expect(find('[data-aid="stg-commit-title"]').value).to eq('Add file.txt')
    expect(find('[data-aid="stg-commit-body"]').value).to eq('')
    find('[data-aid="stg-commit-title"]').set('Amended')
    expect {
      find('[data-aid="stg-commit-btn"]').click
      expect(page).to have_content("Nothing to commit.")
    }.to change { commits = g.log.execute; commits.count }.by(0)
    last_commit = g.log.execute.first
    expect(last_commit.message).to eq('Amended')
  end

  it 'can amend last commit with file changes' do
    g = init_repo_with_one_file
    visit_git_repo

    FileUtils.touch('new_file.txt')

    within('.files .file') do
      expect(page).to have_content('new_file.txt')
    end

    find('[data-aid="stg-amend-checkbox"]').click
    expect(find('[data-aid="stg-commit-title"]').value).to eq('Add file.txt')
    expect(find('[data-aid="stg-commit-body"]').value).to eq('')

    find('[data-aid="stg-commit-title"]').set('Add new_file.txt')

    expect {
      find('[data-aid="stg-commit-btn"]').click
      expect(page).to have_content("Nothing to commit.")
    }.to change { commits = g.log.execute; commits.count }.by(0)
    
    last_commit = g.log.execute.first
    expect(last_commit.message).to eq('Add new_file.txt')
    expect(last_commit.gtree.blobs.keys).to eq(['file.txt', 'new_file.txt'])
  end
end
