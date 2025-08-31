RSpec.describe '[SQUASH]' do
  it 'squashes' do
    g = init_repo_with_one_file
    
    FileUtils.touch('file2.txt')
    g.add('file2.txt')
    g.commit('Add file2.txt')

    FileUtils.touch('file3.txt')
    g.add('file3.txt')
    g.commit('Add file3.txt')

    visit_git_repo
    expect(page).to have_content('Nothing to commit')

    find('[data-aid="branch"]').click

    expect {
      all('[data-ta-action="squash"]').last.click
      within('.files') do
        expect(page).to have_content('file2.txt')
        expect(page).to have_content('file3.txt')
      end
    }.to change { g.log.execute.size }.by(-2)
  end
end
