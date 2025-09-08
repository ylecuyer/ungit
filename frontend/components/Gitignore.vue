<template>
    <div class="branch">
      <button type="button" class="btn-outline" @click.prevent="editGitignore" data-aid="edit-gitignore-button">
        <Octicon name="file" />
        <span>.gitignore</span>
      </button>
    </div>
</template>

<script setup>
import Octicon from './Octicon.vue';
import programEvents from '/source/js/program-events.js';
import components from '/source/js/components.js';

defineOptions({ name: 'Gitignore' })

const props = defineProps(['repoPath'])

const editGitignore = () => {
  return ungit.server
    .getPromise('/gitignore', { path: props.repoPath })
    .then((res) => {
      return components.showModal('texteditmodal', {
        title: `${props.repoPath}${ungit.config.fileSeparator}.gitignore`,
        content: res.content,
        closeFunc: (isYes) => {
          if (isYes) {
            ungit.server.putPromise('/gitignore', {
              path: props.repoPath,
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
          command: `fs.write "${props.repoPath}${ungit.config.fileSeparator}.gitignore"`,
          error: e.message || e.errorSummary,
          stdout: '',
          stderr: e.stack,
          repoPath: props.repoPath,
        },
      });
    });
}
</script>