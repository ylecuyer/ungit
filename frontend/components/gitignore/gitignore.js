import ko from 'knockout';
import components from '/source/js/components.js';
import octicons from '@primer/octicons';
import gitignoreTemplate from './gitignore.html?raw';
import programEvents from '/source/js/program-events.js';

components.register('gitignore', (args) => new GitignoreViewModel(args));
const gitignoreElement = document.createElement('template');
gitignoreElement.id = 'gitignore';
gitignoreElement.innerHTML = gitignoreTemplate;
document.body.appendChild(gitignoreElement);

class GitignoreViewModel {
  constructor({ server, repoPath }) {
    this.repoPath = repoPath;
    this.server = server;
    this.ignoreIcon = octicons.file.toSVG({ height: 18 });
  }

  updateNode(parentElement) {
    ko.renderTemplate('gitignore', this, {}, parentElement);
  }

  editGitignore() {
    return this.server
      .getPromise('/gitignore', { path: this.repoPath() })
      .then((res) => {
        return components.showModal('texteditmodal', {
          title: `${this.repoPath()}${ungit.config.fileSeparator}.gitignore`,
          content: res.content,
          closeFunc: (isYes) => {
            if (isYes) {
              this.server.putPromise('/gitignore', {
                path: this.repoPath(),
                data: document.querySelector('dialog .text-area-content').value,
              });
            }
          },
        });
      })
      .catch((e) => {
        // Not a git error but we are going to treat like one
        programEvents.dispatch({
          event: 'git-error',
          data: {
            command: `fs.write "${this.repoPath()}${ungit.config.fileSeparator}.gitignore"`,
            error: e.message || e.errorSummary,
            stdout: '',
            stderr: e.stack,
            repoPath: this.repoPath(),
          },
        });
      });
  }
}

export default GitignoreViewModel;
