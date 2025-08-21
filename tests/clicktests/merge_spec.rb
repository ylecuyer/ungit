RSpec.describe '[MERGE]' do
  it 'can merge' do
    g = init_repo_with_two_branches
    visit_git_repo

    find('[data-aid="branch"]', text: 'bugfix').click
    find('[data-ta-action="merge"]').click
    expect(page).to have_content("Merge branch 'bugfix'")

    last_commit = g.log.first
    expect(last_commit.message).to eq("Merge branch 'bugfix'")
  end

  it 'can resolve merge conflicts' do
    g = init_repo_with_two_branches
    visit_git_repo

    File.open('file.txt', 'w') { |f| f.write("Change from master") }
    g.add('file.txt')
    g.commit("Change from master")

    g.branch('bugfix').checkout
    File.open('file.txt', 'w') { |f| f.write("Change from bugfix") }
    g.add('file.txt')
    g.commit("Change from bugfix")

    g.branch('master').checkout

    find('[data-aid="branch"]', text: 'bugfix').click
    find('[data-ta-action="merge"]').click
    expect(page).to have_content("Files in conflict")
    within '.files .file', match: :first do
      expect(page).to have_content("Conflict")
      find('[data-aid="mark-as-resolved"]').click
    end
    expect(page).to have_no_content("Files in conflict")

    find('[data-aid="stg-btn-continue"]').click
    expect(page).to have_content("Merge branch 'bugfix'")

    last_commit = g.log.first
    expect(last_commit.message).to eq("Merge branch 'bugfix'\n\n# Conflicts:\n#\tfile.txt")
  end
end