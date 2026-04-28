<template>
    <div class="btn-group flex branch">
      <button type="button" class="btn-outline btn-main" @click.prevent="updateRefs">
        <Octicon name="git-branch" />
        <span>{{ refsLabel }}</span>
      </button>

      <div id="branch-dropdown-menu" class="dropdown-menu">
        <button type="button" id="branch-dropdown-menu-trigger" aria-haspopup="menu" aria-controls="demo-dropdown-menu-menu" aria-expanded="false" class="btn-outline dropdown-toggle" data-aid="branch-dropdown-menu-trigger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down text-muted-foreground opacity-50 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
        <div id="branch-dropdown-menu-popover" data-popover data-side="bottom" aria-hidden="true" class="min-w-56">
          <div role="menu" class="max-h-200">
            <div role="group">
              <header class="dropdown-header options" onclick="event.stopPropagation()">
                <label>
                  <input
                    :class="'glyphicon ' + (isShowRemote ? 'glyphicon-check' : 'glyphicon-unchecked')"
                    type="checkbox"
                    :checked="isShowRemote"
                    @click.prevent="isShowRemote = !isShowRemote"
                  />
                  Remote
                </label>
                <label>
                  <input
                    :class="'glyphicon ' + (isShowBranch ? 'glyphicon-check' : 'glyphicon-unchecked')"
                    type="checkbox"
                    :checked="isShowBranch"
                    @click.prevent="isShowBranch = !isShowBranch"
                  />
                  Branch
                </label>
                <label>
                  <input
                    :class="'glyphicon ' + (isShowTag ? 'glyphicon-check' : 'glyphicon-unchecked')"
                    type="checkbox"
                    :checked="isShowTag"
                    @click.prevent="isShowTag = !isShowTag"
                  />
                  Tag
                </label>
              </header>
              <hr role="separator" />
              <div class="flex gap-2" v-for="ref in branchesAndLocalTags">
                <a
                  role="menuitem"
                  href="#"
                  @click.prevent="checkoutBranch(ref)"
                  :data-ta-clickable="'checkout' + ref.name"
                  v-html="ref.displayHtml()"
                >
                </a>
                <a
                  href="#"
                  class="btn-ghost"
                  @click.prevent="branchRemove(ref)"
                  :data-ta-clickable="ref.name + '-remove'"
                >
                    <Octicon name="x" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import programEvents from '/source/js/program-events.js';
import components from '/source/js/components.js';
import Octicon from './Octicon.vue';
import _ from 'lodash';
import storage from '/source/js/storage.js';
import { useRepositoryStore } from '../stores/repositoryStore.js';

defineOptions({
  name: 'Branches'
})

const props = defineProps(['repoPath']);
const current = ref('');
const repositoryStore = useRepositoryStore();

const checkoutBranch = (branch) => {
    branch.checkout();
  }


var shouldAutoFetch = ungit.config.autoFetch;

const isShowRemote = ref(true);
const isShowBranch = ref(true);
const isShowTag = ref(true);

const setLocalStorageAndUpdate = (localStorageKey, value) => {
  storage.setItem(localStorageKey, value);
  updateRefs();
  return value;
};

var apiCache = undefined;

const isSamePayload = (value) => {
    const jsonString = JSON.stringify(value);

    if (apiCache === jsonString) {
        ungit.logger.debug(`ignoring redraw for same branches payload.`);
        return true;
    }
    ungit.logger.debug(`redrawing branches payload.  \n${jsonString}`);

    apiCache = jsonString;
    return false;
}


watch(isShowRemote, (newValue, oldValue) => {
      apiCache = undefined;
      setLocalStorageAndUpdate('showRemote', newValue);
});

watch(isShowBranch, (newValue, oldValue) => {
      apiCache = undefined;
      setLocalStorageAndUpdate('showBranch', newValue);
});

watch(isShowTag, (newValue, oldValue) => {
      apiCache = undefined;
      setLocalStorageAndUpdate('showTag', newValue);
});

const branchesAndLocalTags = ref([]);

const _updateRefs = async (forceRemoteFetch) => {
    forceRemoteFetch = forceRemoteFetch || shouldAutoFetch || '';

  repositoryStore.initializeContext(ungit.server, props.repoPath);

    const branchesProm = ungit.server.getPromise('/branches', { path: props.repoPath });
    const refsProm = ungit.server.getPromise('/refs', {
      path: props.repoPath,
      remoteFetch: forceRemoteFetch,
    });

    try {
      // set current branch
      (await branchesProm).forEach((b) => {
        if (b.current) {
          current.value = b.name;
          repositoryStore.setCheckedOutBranch(b.name);
        }
      });
    } catch (e) {
      current.value = '~error';
      ungit.logger.warn('error while setting current branch', e);
    }

    try {
      // update branches and tags references.
      const refs = await refsProm;
      if (isSamePayload(refs)) {
        return;
      }
      branchesAndLocalTags.value = repositoryStore.applyRefsPayload(refs, {
        showRemote: isShowRemote.value,
        showBranch: isShowBranch.value,
        showTag: isShowTag.value,
      });
    } catch (e) {
      ungit.logger.error('error during branch update: ', e);
    }
  }

const defaultDebounceOption = {
  maxWait: 1500,
  leading: false,
  trailing: true
};

const updateRefs = _.debounce(_updateRefs, 250, defaultDebounceOption);

const clickFetch = () => {
    updateRefs(true);
}

programEvents.add((event) => {
    if (
      event.event === 'request-app-content-refresh' ||
      event.event === 'branch-updated' ||
      event.event === 'git-directory-changed' ||
      event.event === 'current-remote-changed'
    ) {
      updateRefs();
    }
  });

const branchRemove = (branch) => {
  let details = `"${branch.refName}"`;
  if (branch.isRemoteBranch) {
    details = `<code style='font-size: 100%'>REMOTE</code> ${details}`;
  }
  components.showModal('yesnomodal', {
    title: 'Are you sure?',
    details: 'Deleting ' + details + ' branch cannot be undone with ungit.',
    closeFunc: (isYes) => {
      if (!isYes) return;
      return branch.remove();
    },
  });
}

const refsLabel = computed(() => current.value || 'master (no commits yet)');
</script>

<style>
.branch {
  color: black;
  .options {
    font-size: inherit;
    color: $gray-dark;

    label {
      cursor: pointer;
      font-weight: normal;
      margin: 0 15px 0 0;

      &:last-child {
        margin: 0;
      }
    }

    input {
      -moz-appearance: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
    }
  }

  .dropdown-menu.octicon {
    width: 18px;
  }
}
</style>