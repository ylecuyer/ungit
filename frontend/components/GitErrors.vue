<template>
  <div v-for="gitError in gitErrors" class="static my-4 alert border-amber-50 bg-amber-50 text-amber-900 dark:border-amber-950 dark:bg-amber-950 dark:text-amber-100" data-bind="css: { 'alert-danger': !isWarning, 'alert-warning': isWarning }">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
    <button type="button" class="absolute top-0 right-0 close btn-ghost" @click.prevent="dismiss(gitError)">
      <Octicon name="x" />
    </button>
    <h2>
      Unhandled git error!
    </h2>
    <section>
      <p>
        Ungit tried to run a git command that resulted in an unhandled error.
        <span data-bind="visible: bugReportWasSent">An automatic bug report was sent.</span>
      </p>
      <p v-if="gitError.tip">{{ gitError.tip }}</p>
      <h4>Command</h4>
      <p class="badge-secondary">{{  gitError.command }}</p>
      <h4>Error</h4>
      <p class="badge-secondary">{{ gitError.error }}</p>
      <div v-if="gitError.stderr">
        <h4>Stderr</h4>
        <p class="badge-secondary">{{ gitError.stderr }}</p>
      </div>
      <div v-if="gitError.stdout">
        <h4>Stdout</h4>
        <p class="badge-secondary">{{ gitError.stdout }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import programEvents from '/source/js/program-events.js';

defineOptions({
  name: 'GitError',
})

const props = defineProps(['repoPath']);

const gitErrors = ref([]);

const _handleGitError= (event) => {
  if (event.data.repoPath != props.repoPath) return;
  gitErrors.value.push(event.data);
}

programEvents.add((event) => {
  if (event.event == 'git-error') _handleGitError(event);
});


const dismiss = (gitError) => {
  gitErrors.value = gitErrors.value.filter(e => e !== gitError);
}
</script>