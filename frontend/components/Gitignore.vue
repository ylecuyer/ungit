<template>
    <div>
      <button type="button" class="btn-outline" @click.prevent="editGitignore" data-aid="edit-gitignore-button">
        <Octicon name="file" />
        <span>.gitignore</span>
      </button>

      <dialog ref="alertDialog" class="dialog" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <div>
          <header>
            <h2 id="alert-dialog-title">{{ title }}</h2>
          </header>
          
          <section>
          <textarea class="textarea" spellcheck="false"
            style="height: 250px; font-family: monospace; resize: vertical;" v-model="gitignoreContent"></textarea>
          </section>

          <footer>
            <button class="btn-outline" @click="alertDialog.close()">Cancel</button>
            <button class="btn-primary" @click="saveGitignore">Save</button>
          </footer>
        </div>
      </dialog>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Octicon from './Octicon.vue';
import programEvents from '/source/js/program-events.js';
import components from '/source/js/components.js';

defineOptions({ name: 'Gitignore' })

const props = defineProps(['repoPath'])
const gitignoreContent = ref(null);
const alertDialog = ref(null);

const title = computed(() => {
  return `${props.repoPath}${ungit.config.fileSeparator}.gitignore`;
});

const saveGitignore = async () => {
  await ungit.server.putPromise('/gitignore', {
    path: props.repoPath,
    data: gitignoreContent.value,
  });
  alertDialog.value.close();
};

const editGitignore = async () => {
  gitignoreContent.value = (await ungit.server.getPromise('/gitignore', { path: props.repoPath })).content;
  alertDialog.value.showModal()
}
</script>