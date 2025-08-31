RSpec.describe '[STASH]' do
  it 'stashes' do
    g = init_repo_with_one_file
    FileUtils.touch('file2.txt')
    
    visit_git_repo

    expect(page).to have_content('Stash (0)')
    expect {
      find('[data-aid="stash-all"]').click
      expect(page).to have_content('Stash (1)')
    }.to change { g.branch.stashes.size }.by(1)


    expect(g.branch.stashes.first.message).to include('Add file.txt')
  end

  it 'deletes a stash' do
    g = init_repo_with_one_file
    FileUtils.touch('file2.txt')
    g.add('file2.txt')
    g.branch.stashes.save('WIP on master: Add file.txt')

    visit_git_repo
    expect(page).to have_content('Stash (1)')
    find('[data-aid="show-stashes"]').click
    find('[data-aid="show-stash-diff"]').click
    expect(page).to have_content('WIP on master: Add file.txt')
    find('[data-aid="delete-stash"]').click
    find('[data-ta-action="yes"]').click
    expect(page).to have_no_content('Stash')
    expect(g.branch.stashes.size).to eq(0)
  end

  it 'applies a stash' do
    g = init_repo_with_one_file
    FileUtils.touch('file2.txt')
    g.add('file2.txt')
    g.branch.stashes.save('WIP on master: Add file.txt')

    visit_git_repo
    expect(page).to have_content('Stash (1)')
    find('[data-aid="show-stashes"]').click
    find('[data-aid="show-stash-diff"]').click
    expect(page).to have_content('WIP on master: Add file.txt')
    find('[data-aid="apply-stash"]').click
    within('.files') do
      expect(page).to have_content('file2.txt')
    end
    expect(g.branch.stashes.size).to eq(1)
    expect(File).to exist('file2.txt')
  end
end
