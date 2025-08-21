module GitHelpers
    def visit_git_repo
        current_dir = Dir.pwd
        visit "/#/repository?path=#{current_dir}"
        current_dir
    end

    def init_repo_with_one_file
        g = Git.init
        FileUtils.touch('file.txt')
        g.add('file.txt')
        g.commit('Add file.txt')
        g
    end

    def init_repo_with_two_branches
        g = init_repo_with_one_file
        branch = g.branch('bugfix')
        branch.create
        branch.checkout

        FileUtils.touch('file2.txt')
        g.add('file2.txt')
        g.commit('Add file2.txt')

        g.branch('master').checkout
        g
    end
end