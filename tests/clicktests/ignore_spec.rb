RSpec.describe '[IGNORE]' do
    it 'Add a file to .gitignore file' do
        g = Git.init
        File.write('.gitignore', "# Ignore files\n")
        FileUtils.touch('file.txt')

        visit "/#/repository?path=#{Dir.pwd}"
        within('.files .file', text: 'file.txt') do
            expect(page).to have_content('file.txt')
            find('[data-aid="ignore-file"]').click
            expect(page).to have_content(".gitignore")
        end

        expect(File.read('.gitignore')).to eq("# Ignore files\n\nfile.txt")
    end

    it 'Add a file to .gitignore file when .gitignore is missing' do
        g = Git.init
        FileUtils.touch('file.txt')

        visit "/#/repository?path=#{Dir.pwd}"
        within('.files .file', text: 'file.txt') do
            expect(page).to have_content('file.txt')
            find('[data-aid="ignore-file"]').click
            expect(page).to have_content(".gitignore")
        end

        expect(File.read('.gitignore')).to eq("\nfile.txt")
    end

    it 'Attempts to add a file where similar name already exist in .gitignore' do
        g = Git.init
        File.write('.gitignore', "# Ignore files\nmyfile.txt\n")
        FileUtils.touch('file.txt')

        visit "/#/repository?path=#{Dir.pwd}"
        within('.files .file', text: 'file.txt') do
            expect(page).to have_content('file.txt')
            find('[data-aid="ignore-file"]').click
            expect(page).to have_content(".gitignore")
        end

        expect(File.read('.gitignore')).to eq("# Ignore files\nmyfile.txt\n\nfile.txt")
    end

    it 'Can edit .gitignore file' do
        g = Git.init
        File.write('.gitignore', "# Ignore files\nmyfile.txt\n")
        FileUtils.touch('file.txt')

        visit "/#/repository?path=#{Dir.pwd}"
        within('.files .file', text: 'file.txt') do
            expect(page).to have_content('file.txt')
        end

        find('[data-aid="edit-gitignore-button"]').click
        expect(find('.text-area-content').value).to eq("# Ignore files\nmyfile.txt\n")
        find('.text-area-content').fill_in(with: "# Ignore files\nmyfile.txt\n\nfile.txt")
        find('[data-ta-action="save"]').click

        within('.files') do
            expect(page).to have_content('.gitignore')
            expect(page).to have_no_content('file.txt')
        end

        expect(File.read('.gitignore')).to eq("# Ignore files\nmyfile.txt\n\nfile.txt")
    end
end