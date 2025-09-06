<template>
    <div class="list-group-item" data-aid="stash-item">
      <a
        href="#"
        class="stash-apply octicon-circled"
        @click.prevent="apply(stash.reflogId)"
        data-toggle="tooltip"
        data-aid="apply-stash"
        title="Apply this stash"
      >
        <Octicon name="pencil" />
      </a>
      <a
        href="#"
        class="toggle-show-commit-diffs"
        @click.prevent="showCommitDiff = !showCommitDiff"
        data-toggle="tooltip"
        data-aid="show-stash-diff"
        title="Show stash diff"
      >
        <h4 class="list-group-item-heading">{{ stash.title }}</h4>
        <p class="list-group-item-text">{{ stash.message }}</p>
      </a>
      <div class="diff-wrapper" v-if="showCommitDiff">
        <div class="diff-inner" data-bind="component: commitDiff"></div>
      </div>
      <button
        type="button"
        class="btn btn-default list-item-remove"
        data-bind="html: dropIcon, click: drop"
        data-toggle="tooltip"
        data-aid="delete-stash"
        title="Drop this stash"
      ></button>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
  name: 'StashItem'
})

defineProps(['stash', 'repoPath']);

const apply = (reflogId) => {
    ungit.server
        .delPromise(`/stashes/${reflogId}`, { path: props.repoPath, apply: true })
        .catch((e) => ungit.server.unhandledRejection(e));
}

const showCommitDiff = ref(false);
</script>