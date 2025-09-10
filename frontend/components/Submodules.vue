<template>
    <div class="btn-group flex fetchButton submodule">
      <button type="button" class="btn-outline btn-main">
        <Octicon name="file-submodule" />
        <span>Submodules</span>
      </button>


      <div id="submodule-dropdown-menu" class="dropdown-menu">
        <button type="button" data-aid="submodule-dropdown-menu" id="submodule-dropdown-menu-trigger" aria-haspopup="menu" aria-controls="submodule-dropdown-menu-menu" aria-expanded="false" class="btn-outline dropdown-toggle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down text-muted-foreground opacity-50 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
        </button>
        <div id="submodule-dropdown-menu-popover" data-popover aria-hidden="true" class="min-w-56">
          <div role="menu">
            <div role="group">
              <div class="flex gap-2" v-for="submodule in submodules">
                <a role="menuitem"
                  href="#"
                  @click.prevent="submodulePathClick(submodule)"
                  :data-ta-clickable="submodule.name"
                >{{ submodule.name }}</a>
                <a
                  href="#"
                  class="btn-ghost"
                  @click.prevent="submoduleLinkClick(submodule)"
                  :data-ta-clickable="submodule.name + '-weblink'"
                >
                    <Octicon name="link-external" />
                </a>
                <a
                  href="#"
                  class="btn-ghost"
                  @click.prevent="submoduleRemove(submodule)"
                  :data-ta-clickable="submodule.name + '-remove'"
                >
                    <Octicon name="x" />
                </a>
              </div>
              <div v-if="submodules.length > 0">
                <hr role="separator" />
                <a role="menuitem" href="#" class="update-submodule" @click.prevent="updateSubmodules">Update Submodules</a>
                <hr role="separator" />
              </div>
              <a role="menuitem" href="#" class="add-submodule" data-aid="add-submodule" @click.prevent="showAddSubmoduleDialog">Add Submodules</a>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import programEvents from '../source/js/program-events';
import components from '../source/js/components';

defineOptions({
  name: 'Submodules'
})

const submodules = ref(['test']);
const props = defineProps(['repoPath']);

const _fetchSubmodules = async () => {
    try {
      const submodulesData = await ungit.server.getPromise('/submodules', { path: props.repoPath });
      submodules.value = submodulesData;
    } catch (e) {
      ungit.logger.error('error during fetchSubmodules', e);
    }
  }

const updateSubmodules = () => {
    return ungit.server
        .postPromise('/submodules/update', { path: props.repoPath })
        .catch((e) => ungit.server.unhandledRejection(e));
}

const showAddSubmoduleDialog = () => {
  components.showModal('addsubmodulemodal', { path: props.repoPath });
}

const submoduleLinkClick = (submodule) => {
  window.location.href = submodule.url;
  }

const submodulePathClick = (submodule) => {
  window.location.href = document.URL + ungit.config.fileSeparator + submodule.path;
}

  const submoduleRemove = (submodule) => {
    components.showModal('yesnomodal', {
      title: 'Are you sure?',
      details: `Deleting ${submodule.name} submodule cannot be undone with ungit.`,
      closeFunc: (isYes) => {
        if (!isYes) return;
        ungit.server
          .delPromise('/submodules', {
            path: props.repoPath,
            submodulePath: submodule.path,
            submoduleName: submodule.name,
          })
          .then(() => {
            programEvents.dispatch({ event: 'submodule-fetch' });
          })
          .catch((e) => ungit.server.unhandledRejection(e));
      },
    });
  }

programEvents.add((event) => {
    if (event.event == 'submodule-fetch') {
      fetchSubmodules();
    }
});

watchEffect(() => {
    _fetchSubmodules();
});
</script>