RSpec.describe '[BARE]' do
  it 'can show the bare repo' do
    g = Git.init '.', bare: true

    current_dir = Dir.pwd
    visit "/#/repository?path=#{current_dir}"
    expect(page.title).to eq("#{File.basename(current_dir)} < tmp")
  end
end
