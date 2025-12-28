<template>
    <div class="flex btn-group fetchButton">
      <button
        type="button"
        class="btn-outline btn-main"
        data-aid="fetch-button"
        :disabled="!fetchEnabled"
        @click.prevent="clickFetch"
      >
        <Octicon name="download" />
        <span>{{ fetchLabel }}</span>
      </button>
  
      <div id="remote-dropdown-menu" class="dropdown-menu">
        <button type="button" id="remote-dropdown-menu-trigger" aria-haspopup="menu" aria-controls="remote-dropdown-menu-menu" aria-expanded="false" class="btn-outline dropdown-toggle" data-aid="remote-dropdown-menu-trigger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down text-muted-foreground opacity-50 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
        <div id="remote-dropdown-menu-popover" data-popover aria-hidden="true" class="min-w-56">
          <div role="menu">
            <div role="group">
              <div class="flex gap-2" v-for="remote in remotes">
                <a role="menuitem" 
                    href="#"
                    :data-ta-clickable="remote.name"
                    :title="remote.title"
                    @click.prevent="remote.changeRemote()"
                >{{ remote.name }}</a>
                <a class="btn-ghost" href="#"
                  :data-ta-clickable="remote.name + '-remove'"
                    @click.prevent="remoteRemove(remote)">
                    <Octicon name="x" />
                </a>
              </div>
              <hr role="separator" v-if="remotes.length > 0" />
              <div role="menuitem">
                <a href="#" data-aid="add-remote" class="add-new-remote" @click.prevent="showAddRemoteDialog">Add a new remote</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <dialog ref="alertDialog" class="dialog" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <div>
          <header>
            <h2 id="alert-dialog-title">Add a new remote</h2>
          </header>
          
          <section>
            <form class="form grid gap-6">
              <div class="grid gap-2">
                <label for="demo-form-text">Name</label>
                <input type="text" id="demo-form-text" v-model="name">
              </div>
              <div class="grid gap-2">
                <label for="demo-form-text">URL</label>
                <input type="text" id="demo-form-text" v-model="url">
              </div>
            </form>
          </section>

          <footer>
            <button class="btn-outline" @click="alertDialog.close()">Cancel</button>
            <button class="btn-primary" @click="saveRemote">Submit</button>
          </footer>
        </div>
      </dialog>


      <dialog ref="confirmDialog" class="dialog" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <div>
        <header>
          <h2 id="alert-dialog-title">Are you sure?</h2>
          <p>Remote {{ remoteToRemove?.name }} will be removed.</p>
        </header>

        <footer>
          <button class="btn-outline" @click="confirmDialog.close()">Cancel</button>
          <button class="btn-primary" @click="removeRemote">Continue</button>
        </footer>
      </div>
    </dialog>
    </div>
</template>

<script setup>
import { watchEffect, watch, computed, ref } from 'vue';
import programEvents from '/source/js/program-events.js';
import _ from 'lodash';
import Octicon from './Octicon.vue';

defineOptions({
  name: 'Remotes'
})

const props = defineProps(['repoPath']);
const currentRemote = ref(null);
const alertDialog = ref(null);
const name = ref('');
const url = ref('');

const confirmDialog = ref(null);
const remoteToRemove = ref(null);

let shouldAutoFetch = ungit.config.autoFetch;

watch(currentRemote, (newValue, oldValue) => {
    programEvents.dispatch({ event: 'current-remote-changed', newRemote: newValue });
});

const remotes = ref([]);
const fetchEnabled = computed(() => remotes.value.length > 0);

const fetchLabel = computed(() => {
    if (currentRemote.value) return `Fetch from ${currentRemote.value}`;
    else return 'No remotes specified';
});

const fetch = async (options) => {
    if (!currentRemote.value) return;
    ungit.logger.debug('remotes.fetch() triggered');

    try {
      const tagPromise = options.tags
        ? ungit.server.getPromise('/remote/tags', {
            path: props.repoPath,
            remote: currentRemote.value,
          })
        : null;
      const fetchPromise = options.nodes
        ? ungit.server.getPromise('/fetch', { path: props.repoPath, remote: currentRemote.value })
        : null;

      if (tagPromise) {
        programEvents.dispatch({ event: 'remote-tags-update', tags: await tagPromise });
      }
      if (fetchPromise) {
        await fetchPromise;
      }
      if (!ungit.server.isInternetConnected) {
        ungit.server.isInternetConnected = true;
      }
    } catch (err) {
      let errorMessage;
      let stdout;
      let stderr;
      try {
        errorMessage = `Ungit has failed to fetch a remote.  ${err.res.body.error}`;
        stdout = err.res.body.stdout;
        stderr = err.res.body.stderr;
      } catch {
        errorMessage = '';
      }

      if (errorMessage.includes('Could not resolve host')) {
        if (ungit.server.isInternetConnected) {
          ungit.server.isInternetConnected = false;
          errorMessage =
            'Could not resolve host. This usually means you are disconnected from internet and no longer push or fetch from remote. However, Ungit will be functional for local git operations.';
          stdout = '';
          stderr = '';
        } else {
          // Message is already seen, just return
          return;
        }
      }

      programEvents.dispatch({
        event: 'git-error',
        data: {
          isWarning: true,
          command: err.res.body.command,
          error: err.res.body.error,
          stdout,
          stderr,
          repoPath: err.res.body.workingDirectory,
        },
      });
    } finally {
      ungit.logger.debug('remotes.fetch() finished');
    }
}

const clickFetch = () => {
    fetch({ nodes: true, tags: true });
}

const updateRemotes = () => {
    return ungit.server
      .getPromise('/remotes', { path: props.repoPath })
      .then((_remotes) => {
        _remotes = _remotes.map((remote) => ({
          name: remote.name,
          title:
            remote.fetchUrl == remote.pushUrl
              ? `Fetch/Push ${remote.fetchUrl || remote.pushUrl || remote.url}`
              : `Fetch ${remote.fetchUrl || remote.url}\nPush ${remote.pushUrl || remote.url}`,
          changeRemote: () => {
            currentRemote.value = remote.name;
          },
        }));
        remotes.value = _remotes;
        if (!currentRemote.value && _remotes.length > 0) {
          if (_.find(_remotes, { name: 'origin' })) {
            // default to origin if it exists
            currentRemote.value = 'origin';
          } else {
            // otherwise take the first one
            currentRemote.value = _remotes[0].name;
          }

          if (shouldAutoFetch) {
            shouldAutoFetch = false;
            return fetch({ nodes: true, tags: true });
          }
        }
      })
      .catch((err) => {
        if (err.errorCode != 'not-a-repository') {
          ungit.server.unhandledRejection(err);
        } else {
          ungit.logger.warn('updateRemotes failed', err);
        }
      });
  }

watchEffect(() => {
    updateRemotes();
});

const remoteRemove = (remote) => {
    remoteToRemove.value = remote;
    confirmDialog.value.showModal();
};
const removeRemote = async () => {
  const remote = remoteToRemove.value;
  try {
    await ungit.server
      .delPromise(`/remotes/${remote.name}`, { path: props.repoPath });
    updateRemotes();
  } catch (e) {
    ungit.server.unhandledRejection(e);
  }
  confirmDialog.value.close();
};

const showAddRemoteDialog = () => {
  alertDialog.value.showModal()
}

const saveRemote = async () => {
  try {
    await ungit.server.postPromise(`/remotes/${encodeURIComponent(name.value)}`, {
      path: props.repoPath,
      url: url.value,
    });
    ungit.programEvents.dispatch({ event: 'update-remote' });
  } catch (e) {
    ungit.server.unhandledRejection(e);
  }
  finally {
    alertDialog.value.close();
    name.value = '';
    url.value = '';
  }
};

programEvents.add((event) => {
    if (event.event === 'request-app-content-refresh' || event.event === 'request-fetch-tags') {
      fetch({ tags: true });
    } else if (event.event === 'git-directory-changed' && shouldAutoFetch) {
      fetch({ tags: true });
    } else if (event.event === 'update-remote') {
      updateRemotes();
    }
  });
</script>