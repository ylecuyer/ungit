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
end