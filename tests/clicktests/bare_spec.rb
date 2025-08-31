RSpec.describe '[BARE]' do
  it 'can show the bare repo' do
    g = Git.init '.', bare: true

    current_dir = visit_git_repo
    expect(page.title).to eq("#{File.basename(current_dir)} < tmp")
  end
end
