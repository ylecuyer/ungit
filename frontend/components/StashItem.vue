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
        <h4 class="list-group-item-heading">{{ title }}</h4>
        <p class="list-group-item-text">{{ stash.message }}</p>
      </a>
      <div class="diff-wrapper" v-if="showCommitDiff">
        <CommitDiff class="diff-inner" :showDiffButtons="true" :commitLineDiffs="stash.fileLineDiffs" :repoPath="repoPath" :sha1="stash.sha1" />
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
import { ref, computed } from 'vue';

import moment from 'moment';

defineOptions({
  name: 'StashItem'
})

const props = defineProps(['stash', 'repoPath']);

const title = computed(() => `${props.stash.reflogName} ${moment(new Date(props.stash.commitDate)).fromNow()}`);

const apply = (reflogId) => {
    ungit.server
        .delPromise(`/stashes/${reflogId}`, { path: props.repoPath, apply: true })
        .catch((e) => ungit.server.unhandledRejection(e));
}

const showCommitDiff = ref(false);
</script>