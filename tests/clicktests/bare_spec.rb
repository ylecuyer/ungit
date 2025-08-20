RSpec.describe '[BARE]' do
  it 'can show the bare repo' do
    Dir.mktmpdir do |dir|
      g = Git.init dir, bare: true

      visit "/#/repository?path=#{dir}"
      expect(page.title).to eq("#{File.basename(dir)} < tmp")
    end
  end
end
