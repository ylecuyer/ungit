RSpec.describe '[SUBMODULE]' do
  
  around do |example|
    Dir.mktmpdir do |dir|
      Dir.chdir(dir) do
        g = Git.init
        FileUtils.touch('file.txt')
        g.add('file.txt')
        g.commit('Add file.txt')
      end

      example.metadata[:submodule_dir] = dir
      example.run
    end
  end

  it 'can add a submodule' do |example|
    g = init_repo_with_one_file

    visit_git_repo
    find('[data-aid="submodule-dropdown-menu"]').click
    find('[data-aid="add-submodule"]').click

    fill_in 'Path', with: 'submodule'
    fill_in 'Url', with: example.metadata[:submodule_dir]

    find('[data-aid="form-modal-submit"]').click

    within('.files') do
      expect(page).to have_content('submodule')
      expect(page).to have_content('.gitmodules')
    end
  end

  it 'can update a submodule' do
    skip 'Not implemented yet'
  end

  it 'can move into a submodule' do
    skip 'Not implemented yet'
  end

  it 'shows submodule changes in the parent repo' do
    skip 'Not implemented yet'
  end

  it 'shows dirty submodule changes' do
    skip 'Not implemented yet'
  end
end
