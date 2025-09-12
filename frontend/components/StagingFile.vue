<template>
    <div class="file" data-bind="css: { showingDiffs: isShowingDiffs }">
      <div
        class="checkmark"
        @click="toggleStaged"
        :class="{ checked: editState !== 'none' }"
      >
        <span
          class="glyphicon"
          :class="{
            'glyphicon-check': editState === 'staged',
            'glyphicon-unchecked': editState === 'none',
            'glyphicon-list-alt': editState === 'patched'
          }"
        ></span>
      </div>
      <button class="name btn btn-default" @click.prevent="toggleDiffs">
        <span v-text="displayName"></span>
      </button>
      <span class="new" v-if="isNew">New</span>
      <span class="deleted" v-if="removed">Removed</span>
      <span class="additions" v-text="additions"></span>
      <span class="deletions" v-text="deletions"></span>
      <span class="modified" v-if="modified">Modified</span>
      <span class="conflict" v-if="conflict"
        ><span class="badge-destructive">Conflicts</span
        ><span
          class="btn-outline launchmergetool explanation"
          v-if="mergeTool"
          @click.prevent="launchMergeTool"
          >Launch Merge Tool</span
        >
        <span data-aid="mark-as-resolved" class="btn-sm-secondary markresolved explanation" @click.prevent="resolveConflict"
          >Mark as Resolved</span
        ></span
      >
      <button
        class="patch btn"
        v-if="isShowPatch"
        @click.prevent="patchClick"
        data-toggle="tooltip"
        title="Patch changes"
      >
        Patch
      </button>
      <button
        class="ignore btn"
        @click.prevent="ignoreFile"
        data-toggle="tooltip"
        data-aid="ignore-file"
        title="Add to .gitignore"
      >
        <Octicon name="skip" />
      </button>
      <button
        class="discard btn"
        @click.prevent="discardChanges"
        data-toggle="tooltip"
        title="Discard changes"
        data-aid="discard"
      >
        <Octicon name="x" />
      </button>
      <!-- ko if: isShowingDiffs -->
      <div class="diffContainer" data-bind="component: diff"></div>
      <!-- /ko -->
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import components from '/source/js/components.js';
import programEvents from '/source/js/program-events.js';

defineOptions({
  name: 'StagingFile',
});

const props = defineProps(['repoPath', 'name', 'oldName', 'displayName', 'inMerge', 'inRebase']);

const editState = ref('staged'); // staged, patched and none
const name = ref(props.name);
const oldName = ref(props.oldName);
const displayName = ref(props.displayName);
const isNew = ref(false);
const removed = ref(false);
const conflict = ref(false);
const renamed = ref(false);
const isShowingDiffs = ref(false);
const additions = ref('');
const deletions = ref('');
const modified = computed(() => {
    // only show modfied whe not removed, not conflicted, not new, not renamed
    // and length of additions and deletions is 0.
    return (
    !removed.value &&
    !conflict.value &&
    !isNew.value &&
    additions.value.length === 0 &&
    deletions.value.length === 0
    );
});
const fileType = ref('text');
const patchLineList = ref([]);
const diff = ref();
const isShowPatch = computed(
    () =>
    // if not new file
    // and if not merging
    // and if not rebasing
    // and if text file
    // and if diff is showing, display patch button
    !isNew.value &&
    !props.inMerge &&
    !props.inRebase &&
    fileType.value === 'text' &&
    isShowingDiffs.value
);
const mergeTool = computed(() => conflict.value && mergeTool !== false);

watch(editState, (value) => {
    if (value === 'none') {
    patchLineList.value.removeAll();
    } else if (value === 'patched') {
    if (diff.value.render) diff.value.render();
    }
});

const getSpecificDiff = () => {
return components.create(!name.value || `${fileType.value}diff`, {
    filename: name.value,
    oldFilename: oldName.value,
    displayFilename: displayName.value,
    repoPath: props.repoPath,
    server: ungit.server,
    textDiffType: staging.textDiffType,
    whiteSpace: staging.whiteSpace,
    isShowingDiffs: isShowingDiffs.value,
    patchLineList: patchLineList.value,
    editState: editState.value,
    wordWrap: staging.wordWrap,
});
}

const setState = (state) =>{
displayName.value = state.displayName;
isNew.value = state.isNew;
removed.value = state.removed;
conflict.value = state.conflict;
renamed.value = state.renamed;
fileType.value = state.type;
additions.value = state.additions != '-' ? `+${state.additions}` : '';
deletions.value = state.deletions != '-' ? `-${state.deletions}` : '';
if (diff.value) {
    diff.value.invalidateDiff();
} else {
    diff.value = getSpecificDiff();
}
if (diff.value.isNew) diff.value.isNew(state.isNew);
if (diff.value.isRemoved) diff.value.isRemoved(state.removed);
}

const toggleStaged = () => {
if (editState.value === 'none') {
    editState.value = 'staged';
} else {
    editState.value = 'none';
}
patchLineList.value = [];
}

const discardChanges = () => {
    const timeSinceLastMute = new Date().getTime() - staging.mutedTime;
    const isMuteWarning = timeSinceLastMute < ungit.config.disableDiscardMuteTime;
    ungit.logger.debug(
      `discard time since mute: ${timeSinceLastMute}, isMuteWarning: ${isMuteWarning}`
    );
    if (ungit.config.disableDiscardWarning || isMuteWarning) {
      ungit.server
        .postPromise('/discardchanges', { path: props.repoPath, file: name.value })
        .catch((e) => ungit.server.unhandledRejection(e));
    } else {
      components.showModal('yesnomutemodal', {
        title: 'Are you sure you want to discard these changes?',
        details: 'This operation cannot be undone.',
        closeFunc: (isYes, isMute) => {
          if (isYes) {
            ungit.server
              .postPromise('/discardchanges', { path: props.repoPath, file: name.value })
              .catch((e) => ungit.server.unhandledRejection(e));
          }
          if (isMute) {
            staging.mutedTime = new Date().getTime();
          }
        },
      });
    }
  }

const ignoreFile = () => {
ungit.server
    .postPromise('/ignorefile', { path: props.repoPath, file: name.value })
    .catch((err) => {
    if (err.errorCode == 'file-already-git-ignored') {
        // The file was already in the .gitignore, so force an update of the staging area (to hopefully clear away this file)
        programEvents.dispatch({ event: 'working-tree-changed' });
    } else {
        ungit.server.unhandledRejection(err);
    }
    });
}

const resolveConflict = () => {
    ungit.server
      .postPromise('/resolveconflicts', { path: props.repoPath, files: [name.value] })
      .catch((e) => ungit.server.unhandledRejection(e));
  }

const launchMergeTool = () => {
ungit.server
    .postPromise('/launchmergetool', {
    path: props.repoPath,
    file: name.value,
    tool: mergeTool,
    })
    .catch((e) => ungit.server.unhandledRejection(e));
}

  const toggleDiffs = () => {
    isShowingDiffs.value = !isShowingDiffs.value;
  }

  const patchClick = () => {
    if (!isShowingDiffs.value) return;

    if (editState.value === 'patched') {
      editState.value = 'staged';
    } else {
      editState.value = 'patched';
    }
  }
</script>