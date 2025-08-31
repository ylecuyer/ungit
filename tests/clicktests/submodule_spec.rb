RSpec.describe '[SUBMODULE]' do
  
  around do |example|
    Dir.mktmpdir do |dir|
      Dir.chdir(dir) do
        g = Git.init
        File.write('file.txt', 'Hi')
        g.add('file.txt')
        g.commit('Add file.txt')

        File.write('file2.txt', 'Hello')
        g.add('file2.txt')
        g.commit('Add file2.txt')

        example.metadata[:submodule_dir] = dir
        example.metadata[:submodule_git] = g
      end

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

  it 'can update a submodule' do |example|
    skip "Not implemented yet"

    g = init_repo_with_one_file
    g.lib.send(:command, '-c', 'protocol.file.allow=always', 'submodule', 'add', example.metadata[:submodule_dir], 'submodule')
    g.commit('Add submodule')

    local_submodule = Git.open('submodule')
    local_submodule.checkout(local_submodule.log.execute.last.sha)

    visit_git_repo

    find('[data-aid="submodule-dropdown-menu"]').click
    find('a.update-submodule').click

    within('.files') do
      expect(page).to have_content('submodule')
      expect(page).to have_content('.gitmodules')
    end
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
