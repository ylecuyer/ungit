RSpec.describe '[BOOKMARK]' do
  it 'can bookmark repositories' do
    g = init_repo_with_one_file
    repo_dir = visit_git_repo

    expect(page).to have_content('Bookmarked repositories')
    within('[data-aid="bookmarked-repos"]', visible: false) do
      expect(page).to have_no_selector('li')
    end

    find('[data-aid="bookmark-repo-btn"]').click

    visit '/'

    within('[data-aid="bookmarked-repos"]') do
      expect(page).to have_selector('li', count: 1)
      expect(find('li')).to have_content(File.basename(repo_dir))
    end
  end
end
