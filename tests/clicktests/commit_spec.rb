RSpec.describe '[COMMIT]' do
  it 'can empty commit' do
    g = Git.init
    FileUtils.touch('file.txt')
    g.add('file.txt')
    g.commit('Add file.txt')

    current_dir = Dir.pwd
    visit "/#/repository?path=#{current_dir}"
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
end
