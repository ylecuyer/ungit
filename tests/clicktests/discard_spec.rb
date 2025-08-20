RSpec.describe '[DISCARD]' do
  it 'can discard a file' do
    g = Git.init
    FileUtils.touch('file.txt')

    visit "/#/repository?path=#{Dir.pwd}"
    within('.files .file') do
      expect(page).to have_content('file.txt')
      find('[data-aid="discard"]').click
    end

    expect(page).to have_content("Are you sure you want to discard these changes?")
    find('[data-ta-action="yes"]').click
    expect(page).to have_content("Nothing to commit.")

    expect(File.exist?('file.txt')).to be false
  end

  it 'cancels discard' do
    g = Git.init
    FileUtils.touch('file.txt')

    visit "/#/repository?path=#{Dir.pwd}"
    within('.files .file') do
      expect(page).to have_content('file.txt')
      find('[data-aid="discard"]').click
    end

    expect(page).to have_content("Are you sure you want to discard these changes?")
    find('[data-ta-action="no"]').click
    expect(page).to have_content("file.txt")

    expect(File.exist?('file.txt')).to be true
  end

  it 'discards next files without warning' do
    g = Git.init
    FileUtils.touch('file1.txt')
    FileUtils.touch('file2.txt')

    visit "/#/repository?path=#{Dir.pwd}"
    within('.files .file', match: :first) do
      expect(page).to have_content('file1.txt')
      find('[data-aid="discard"]').click
    end

    expect(page).to have_content("Are you sure you want to discard these changes?")
    find('[data-ta-action="mute"]').click
    expect(page).to have_no_content("file1.txt")

    within('.files .file') do
      expect(page).to have_content('file2.txt')
      find('[data-aid="discard"]').click
    end

    expect(page).to have_content("Nothing to commit.")
    expect(File.exist?('file1.txt')).to be false
    expect(File.exist?('file2.txt')).to be false
  end
end
