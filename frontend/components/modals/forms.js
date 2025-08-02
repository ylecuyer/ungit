import ko from 'knockout';
import { ModalViewModel, FormItems } from './modalBase';
import formModalTemplate from './formModal.html?raw';

ungit.components.register(
  'credentialsmodal',
  (args) => new CredentialsModalViewModel(args.remote)
);
const formModalElement = document.createElement('template');
formModalElement.id = 'formModal';
formModalElement.innerHTML = formModalTemplate;
document.body.appendChild(formModalElement);

ungit.components.register('addremotemodal', (arg) => new AddRemoteModalViewModel(arg.path));
ungit.components.register('addsubmodulemodal', (arg) => new AddSubmoduleModalViewModel(arg.path));

/**
 * Form receives collection of user inputs, i.e. username, password and etc.
 */
class FormModalViewModel extends ModalViewModel {
  constructor(title, taModalName, showCancel) {
    super(title, taModalName);
    this.items = [];
    this.showCancel = showCancel;
    this.template = 'formModal';
  }

  submit() {
    this.close();
  }
}

class CredentialsModalViewModel extends FormModalViewModel {
  constructor(remote) {
    super(`Remote ${remote} requires authentication`, 'credentials-dialog', false);
    this.items.push(new FormItems('Username', ko.observable(), 'text', true));
    this.items.push(new FormItems('Password', ko.observable(), 'password', false));
  }

  submit() {
    super.submit();
    ungit.programEvents.dispatch({
      event: 'request-credentials-response',
      username: this.items[0].value(),
      password: this.items[1].value(),
    });
  }
}

class AddRemoteModalViewModel extends FormModalViewModel {
  constructor(path) {
    super('Add new remote', 'add-remote', true);
    this.repoPath = path;
    this.items.push(new FormItems('Name', ko.observable(), 'text', true));
    this.items.push(new FormItems('Url', ko.observable(), 'text', false));
  }

  async submit() {
    super.submit();
    try {
      await ungit.server.postPromise(`/remotes/${encodeURIComponent(this.items[0].value())}`, {
        path: this.repoPath,
        url: this.items[1].value(),
      });
      ungit.programEvents.dispatch({ event: 'update-remote' });
    } catch (e) {
      ungit.server.unhandledRejection(e);
    }
  }
}

class AddSubmoduleModalViewModel extends FormModalViewModel {
  constructor(path) {
    super('Add new submodule', 'add-submodule', true);
    this.repoPath = path;
    this.items.push(new FormItems('Path', ko.observable(), 'text', true));
    this.items.push(new FormItems('Url', ko.observable(), 'text', false));
  }

  async submit() {
    super.submit();
    try {
      await ungit.server.postPromise('/submodules/add', {
        path: this.repoPath,
        submodulePath: this.items[0].value(),
        submoduleUrl: this.items[1].value(),
      });
      ungit.programEvents.dispatch({ event: 'submodule-fetch' });
    } catch (e) {
      ungit.server.unhandledRejection(e);
    }
  }
}

export {
  FormModalViewModel,
  CredentialsModalViewModel,
  AddRemoteModalViewModel,
  AddSubmoduleModalViewModel
};
