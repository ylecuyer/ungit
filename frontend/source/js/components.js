const components = {};
export default components;
ungit.components = components;

components.registered = {};

components.register = function (name, creator) {
  components.registered[name] = creator;
};

components.create = function (name, args) {
  var componentConstructor = components.registered[name];
  if (!componentConstructor) throw new Error('No component found: ' + name);
  return componentConstructor(args);
};

/**
 * New Vue-native modal system
 * Maps old modal names to new Vue modal calls
 */
components.showModal = (name, args) => {
  // Use new modal system if available
  if (ungit.modalStore) {
    switch (name) {
      case 'credentialsmodal':
        return ungit.modalStore.showCredentialsModal(args.remote, (credentials) => {
          ungit.programEvents.dispatch({
            event: 'request-credentials-response',
            username: credentials.username,
            password: credentials.password,
          });
        });

      case 'yesnomodal':
        return ungit.modalStore.showPromptModal({
          type: 'yesno',
          title: args.title,
          details: args.details,
          options: [
            { label: 'Yes', primary: true, taId: 'yes', callback: () => args.closeFunc(true) },
            { label: 'No', primary: false, taId: 'no', callback: () => args.closeFunc(false) },
          ],
        });

      case 'yesnomutemodal':
        return ungit.modalStore.showPromptModal({
          type: 'yesnoMute',
          title: args.title,
          details: args.details,
          options: [
            { label: 'Yes', primary: true, taId: 'yes', callback: () => args.closeFunc(true, false) },
            { label: 'Yes and mute for awhile', primary: false, taId: 'mute', callback: () => args.closeFunc(true, true) },
            { label: 'No', primary: false, taId: 'no', callback: () => args.closeFunc(false, false) },
          ],
        });

      case 'toomanyfilesmodal':
        return ungit.modalStore.showPromptModal({
          type: 'tooManyFiles',
          title: args.title,
          details: args.details,
          options: [
            { label: `Don't load`, primary: true, taId: 'noLoad', callback: () => args.closeFunc(true) },
            { label: `Load anyway`, primary: false, taId: 'loadAnyway', callback: () => args.closeFunc(false) },
          ],
        });

      case 'addremotemodal':
        return ungit.modalStore.showFormModal({
          type: 'addRemote',
          title: 'Add new remote',
          items: [
            { name: 'Name', value: '', type: 'text', autoFocus: true },
            { name: 'Url', value: '', type: 'text', autoFocus: false },
          ],
          showCancel: true,
          onSubmit: async (values) => {
            try {
              await ungit.server.postPromise(`/remotes/${encodeURIComponent(values[0])}`, {
                path: args.path,
                url: values[1],
              });
              ungit.programEvents.dispatch({ event: 'update-remote' });
            } catch (e) {
              ungit.server.unhandledRejection(e);
            }
          },
        });

      case 'addsubmodulemodal':
        return ungit.modalStore.showFormModal({
          type: 'addSubmodule',
          title: 'Add new submodule',
          items: [
            { name: 'Path', value: '', type: 'text', autoFocus: true },
            { name: 'Url', value: '', type: 'text', autoFocus: false },
          ],
          showCancel: true,
          onSubmit: async (values) => {
            try {
              await ungit.server.postPromise('/submodules/add', {
                path: args.path,
                submodulePath: values[0],
                submoduleUrl: values[1],
              });
              ungit.programEvents.dispatch({ event: 'submodule-fetch' });
            } catch (e) {
              ungit.server.unhandledRejection(e);
            }
          },
        });

      default:
        // Fallback to old system for non-modal components
        const modal = components.create(name, args);
        ungit.programEvents.dispatch({ event: 'modal-show-dialog', modal: modal });
        return modal;
    }
  } else {
    // Fallback if modalStore not initialized yet
    const modal = components.create(name, args);
    ungit.programEvents.dispatch({ event: 'modal-show-dialog', modal: modal });
    return modal;
  }
};

