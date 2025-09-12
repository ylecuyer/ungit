<template>
  <div
    class="card px-6"
    :class="{ commitValidationError: commitValidationError }"
  >
    <div class="panel-body">

      <div v-if="showNux" class="nux">
        Nothing to commit.
        <a data-aid="amend-commit" class="amend-link" href="#" v-if="canAmend" @click="() => amend(true)"
          >Amend previous commit?</a
        >
        <a
          data-aid="empty-commit"
          class="empty-commit-link"
          href="#"
          v-if="canEmptyCommit"
          @click="toggleEmptyCommit"
          >Create an empty commit?</a
        >
      </div>

      <div class="flex gap-4" v-if="!showNux">
        <div class="basis-1/4">
          <div class="form">
            <input
              class="form-control rounded-b-none"
              type="text"
              placeholder="Title (required)"
              data-aid="stg-commit-title"
              aria-label="Commit message title"
              data-bind="value: commitMessageTitle, valueUpdate: 'afterkeydown', enable: !inRebase(), event: {keypress: onEnter}"
            />
            <textarea
              class="form-control commit-body rounded-t-none"
              rows="2"
              placeholder="Body"
              data-aid="stg-commit-body"
              aria-label="Commit message body"
              data-bind="value: commitMessageBody, valueUpdate: 'afterkeydown', enable: !inRebase(), event: {keypress: onAltEnter}"
            ></textarea>
            <label class="label gap-3 my-2" data-bind="visible: canAmend" data-aid="stg-amend-checkbox">
              <input
                type="checkbox"
                class="input"
                data-bind="checked: amend"
              />
              Amend last commit
            </label>
            <label class="label gap-3 my-2" data-aid="stg-skipci-checkbox">
              <input
                type="checkbox"
                class="input"
                :checked="skipCi"
              />
              Skip CI
            </label>
            <div class="flex gap-2 mt-2">
              <div class="btn-group flex commit-grp" v-if="isStageValid">
                <button
                  class="btn btn-main commit-btn"
                  data-aid="stg-commit-btn"
                  @click.prevent="commit"
                  :disabled="commitValidationError"
                >
                  Commit
                </button>

                <div id="demo-dropdown-menu" class="dropdown-menu">
                  <button
                            :disabled="commitValidationError"
                  type="button" id="demo-dropdown-menu-trigger" aria-haspopup="menu" aria-controls="demo-dropdown-menu-menu" aria-expanded="false" class="btn dropdown-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down text-muted-foreground opacity-50 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  <div id="demo-dropdown-menu-popover" data-popover aria-hidden="true" class="min-w-56">
                    <div role="menu">
                      <div role="group">
                              <a role="menuitem"
                                href="#"
                                @click.prevent="commitnpush"
                                :class="{ disabled: !canPush }"
                                class="commitnpush"
                                >Commit & Push</a
                              >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                class="btn-outline"
                data-aid="stg-cancel"
                @click.prevent="cancelAmendEmpty"
                v-if="showCancelButton"
              >
                Cancel
              </button>
              <button
                class="btn btn-primary"
                data-aid="stg-btn-continue"
                v-if="conflictText"
                @click.prevent="conflictContinue"
                :disabled="commitValidationError"
              >
                Continue <span v-text="conflictText" />
              </button>
              <button
                data-aid="stg-btn-abort"
                class="btn btn-warning btn-stg-abort"
                @click.prevent="conflictAbort"
                v-if="conflictText"
              >
                Abort <span v-text="conflictText" />
              </button>
            </div>
            <span
              class="validationError"
              v-if="commitValidationError"
              v-text="commitValidationError"
            ></span>
          </div>
        </div>
        <div class="basis-3/4">
          <div class="flex gap-2">
            <div class="commands btn-group btn-group-sm">
              <span class="badge-secondary" v-text="stats"></span>
              <button
                class="btn-outline"
                @click.prevent="toggleAllStages"
                data-tooltip="Toggle all uncommitted files for commit"
                data-side="bottom"
              >
                <span class="glyphicon" :class="toggleSelectAllGlyphClass"></span>
                Toggle all
              </button>
              <button
                class="btn-outline"
                @click.prevent="discardAllChanges"
                title="Discard all uncommitted file changes, including not showing files"
                data-tooltip="Discard all uncommitted file changes, including not showing files"
                data-side="bottom"
              >
                <Octicon name="trash" />
                Discard all
              </button>
              <button
                class="btn-outline"
                data-aid="stash-all"
                @click.prevent="stashAll"
                :class="{ disabled: !canStashAll }"
                data-side="bottom"
              >
                <Octicon name="pin" />
                Stash all
              </button>
            </div>
            <div class="flex gap-2">
              <button
                class="btn-outline"
                data-bind="click: wordWrap.toggle, css: {active: wordWrap.isActive}"
                data-tooltip="Wrap words per line"
                data-side="bottom"
              >
                <span data-bind="text: wordWrap.text"></span>
              </button>
              <button
                class="btn-outline"
                data-bind="click: textDiffType.toggle, css: {active: textDiffType.isActive}"
                data-tooltip="Show side by side diff view"
                data-side="bottom"
              >
                <span data-bind="text: textDiffType.text"></span>
              </button>
              <button
                class="btn-outline"
                data-bind="click: whiteSpace.toggle, css: {active: whiteSpace.isActive}"
                data-tooltip="Hide whitespace changes in diff"
                data-side="bottom"
              >
                <span data-bind="text: whiteSpace.text"></span>
              </button>
            </div>
          </div>

          <div class="files" v-for="file in files">
            <StagingFile :repoPath="props.repoPath"
              :name="file.name"
              :oldName="file.oldName"
              :displayName="file.displayName"
              :inMerge="inMerge"
              :inRebase="inRebase"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, computed } from 'vue';
import programEvents from '/source/js/program-events.js';
import components from '/source/js/components.js';
import _ from 'lodash';

defineOptions({
  name: 'Staging',
});

const filesToDisplayIncrmentBy = 50;
const filesToDisplayLimit = filesToDisplayIncrmentBy;
const mergeTool = ungit.config.mergeTool;

const props = defineProps(['repoPath', 'graph']);

const commitValidationError = computed(() => {
  if (conflictText.value) {
    if (files.value.some((file) => file.conflict())) return 'Files in conflict';
  } else {
    if (
      !emptyCommit.value &&
      !amend.value &&
      !files.value.some(
        (file) => /*file.editState() === 'staged' || file.editState() === 'patched'*/ true // TODO
      )
    ) {
      return 'No files to commit';
    }
    if (!commitMessageTitle.value) {
      return 'Provide a title';
    }

    if (textDiffType.value === 'sidebysidediff') {
      const patchFiles = files.value.filter((file) => file.editState() === 'patched');
      if (patchFiles.length > 0) return 'Cannot patch with side by side view.';
    }
  }
  return '';
});

const showCancelButton = computed(() => amend.value || emptyCommit.value);

const nFiles = computed(() => files.value.length);
const nStagedFiles = computed(() => files.value.filter((f) => /*f.editState() === 'staged'*/ true).length); // TODO
const allStageFlag = computed(() => nFiles.value !== nStagedFiles.value);
const stats = computed(() => `${nFiles.value} files, ${nStagedFiles.value} to be commited`);

const HEAD = ref(null);
const files = ref([]);
const inRebase = ref(false);
const inMerge = ref(false);
const inCherry = ref(false);

const canStashAll = computed(() => !amend.value);
const canPush = computed(() => !!props.graph.currentRemote());

const toggleSelectAllGlyphClass = computed(() => {
  if (allStageFlag.value) return 'glyphicon-unchecked';
  else return 'glyphicon-check';
});

const commitMessageTitleCount = ref(0);
const commitMessageTitle = ref(null);

const emptyCommit = ref(false);
const canEmptyCommit = computed(() => HEAD.value && !inRebase.value && !inMerge.value);

const amend = ref(false);
watch(amend, (value) => {
  toggleAmend(value);
});
const canAmend = computed(() => HEAD.value && !inRebase.value && !inMerge.value && !emptyCommit.value);
const skipCi = ref(false);

var textDiffType = components.create('textdiff.type');
var whiteSpace = components.create('textdiff.whitespace');


watch(commitMessageTitle, (value) => {
  commitMessageTitleCount.value = value.length;
});

const commitMessageBody = ref(null);

const showNux = computed(
  () => files.value.length == 0 && !amend.value && !inRebase.value && !emptyCommit.value
);


var loadAnyway = false;
var isDiagOpen = false;
var mutedTime = null;

const isStageValid = computed(() => !inRebase.value && !inMerge.value && !inCherry.value);

var conflictContinue;
var conflictAbort;

const conflictText = computed(() => {
  if (inMerge.value) {
    conflictContinue = conflictResolution('/merge/continue');
    conflictAbort = conflictResolution('/merge/abort');
    return 'Merge';
  } else if (inRebase.value) {
    conflictContinue = conflictResolution('/rebase/continue');
    conflictAbort = conflictResolution('/rebase/abort');
    return 'Rebase';
  } else if (inCherry.value) {
    conflictContinue = commit;
    conflictAbort = discardAllChanges;
    return 'Cherry-pick';
  } else {
    conflictContinue = undefined;
    conflictAbort = undefined;
    return undefined;
  }
});

var filesByPath = {};
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

const _refreshContent = async () => {
  ungit.logger.debug('staging.refreshContent() triggered');
  try {
    const headPromise = ungit.server.getPromise('/head', { path: props.repoPath, limit: 1 });
    const statusPromise = ungit.server.getPromise('/status', {
      path: props.repoPath,
      fileLimit: filesToDisplayLimit,
    });
    const log = await headPromise;
    if (log.length > 0) {
      const array = log[0].message.split('\n');
      HEAD.value = { title: array[0], body: array.slice(2).join('\n') };
    } else {
      HEAD.value = null;
    }
    const status = await statusPromise;
    if (isSamePayload(status)) {
      return;
    }
    if (Object.keys(status.files).length > filesToDisplayLimit && !this.loadAnyway) {
      if (this.isDiagOpen) {
        return;
      }
      this.isDiagOpen = true;
      components.showModal('toomanyfilesmodal', {
        title: 'Too many unstaged files',
        details: 'It is recommended to use command line as ungit may be too slow.',
        closeFunc: (isYes) => {
          this.isDiagOpen = false;
          if (isYes) {
            window.location.href = '/#/';
          } else {
            this.loadAnyway = true;
            loadStatus(status);
          }
        },
      });
    } else {
      loadStatus(status);
    }
  } catch (err) {
    if (err.errorCode != 'must-be-in-working-tree' && err.errorCode != 'no-such-path') {
      ungit.server.unhandledRejection(err);
    } else {
      ungit.logger.error('error during staging refresh: ', err);
    }
  } finally {
    ungit.logger.debug('staging.refreshContent() finished');
  }
}

const defaultDebounceOption = {
  maxWait: 1500,
  leading: false,
  trailing: true
};

const refreshContent = _.debounce(_refreshContent, 250, defaultDebounceOption);

const refreshContentThrottled = _.throttle(refreshContent, 500, {
  leading: false,
  trailing: true,
});

watchEffect(() => {
  refreshContentThrottled();
});

const loadStatus = (status) => {
  setFiles(status.files);
  inRebase.value = !!status.inRebase;
  inMerge.value = !!status.inMerge;
  // There are time where '.git/CHERRY_PICK_HEAD' file is created and no files are in conflicts.
  // in such cases we should ignore exception as no good way to resolve it.
  inCherry.value = !!status.inCherry && !!status.inConflict;
  if (inRebase.value) {
    commitMessageTitle.value = 'Rebase conflict';
    commitMessageBody.value = 'Commit messages are not applicable!\n(╯°□°）╯︵ ┻━┻';
  } else if (inMerge.value || inCherry.value) {
    const lines = status.commitMessage.split('\n');
    if (!commitMessageTitle.value) {
      commitMessageTitle.value = lines[0];
      commitMessageBody.value = lines.slice(1).join('\n');
    }
  }
}

const setFiles = (_files) => {
  const newFiles = [];
  for (const fileStatus of Object.values(_files)) {
    let fileViewModel = filesByPath[fileStatus.fileName];
    if (!fileViewModel) {
      filesByPath[fileStatus.fileName] = fileViewModel = {
        staging: this,
        name: fileStatus.fileName,
        oldName: fileStatus.oldFileName,
        displayName: fileStatus.displayName
      };
    } else {
      // this is mainly for patching and it may not fire due to the fact that
      // '/commit' triggers working-tree-changed which triggers throttled refresh
      fileViewModel.diff().invalidateDiff();
    }
    // fileViewModel.setState(fileStatus); // TODO
    newFiles.push(fileViewModel);
  }
  files.value = newFiles;
}

const toggleAmend = (amend) => {
  if (amend && !commitMessageTitle.value) {
    commitMessageTitle.value = HEAD.value.title;
    commitMessageBody.value = HEAD.value.body;
  } else if (!amend) {
    const isPrevDefaultMsg =
      commitMessageTitle.value == HEAD.value.title &&
      commitMessageBody.value == HEAD.value.body;
    if (isPrevDefaultMsg) {
      commitMessageTitle.value = '';
      commitMessageBody.value = '';
    }
  }
}

const toggleEmptyCommit = () => {
  commitMessageTitle.value = 'Empty commit';
  commitMessageBody.value = '';
  emptyCommit.value = true;
}

const resetMessages = () => {
  commitMessageTitle.value = '';
  commitMessageBody.value = '';
  for (const key in filesByPath) {
    const element = filesByPath[key];
    element.diff().invalidateDiff();
    element.patchLineList.removeAll();
    element.isShowingDiffs(false);
    element.editState(element.editState() === 'patched' ? 'none' : element.editState());
  }
  amend.value = false;
  emptyCommit.value = false;
}

const commit = () => {
  const _files = files.value
    .filter((file) => file.editState() !== 'none')
    .map((file) => ({
      name: file.name(),
      patchLineList: file.editState() === 'patched' ? file.patchLineList() : null,
    }));
  let commitMessage = commitMessageTitle.value;
  if (commitMessageBody.value) commitMessage += `\n\n${commitMessageBody.value}`;
  if (skipCi.value) {
    commitMessage = `[ci-skip] ${commitMessage}`;
  }
  ungit.server
    .postPromise('/commit', {
      path: props.repoPath,
      message: commitMessage,
      _files,
      amend: amend.value,
      emptyCommit: emptyCommit.value,
    })
    .then(() => {
      resetMessages();
      skipCi.value = false;
      programEvents.dispatch({ event: 'branch-updated' });
    })
    .catch((e) => ungit.server.unhandledRejection(e));
}

const commitnpush = () => {
  const _files = files.value
    .filter((file) => file.editState() !== 'none')
    .map((file) => ({
      name: file.name(),
      patchLineList: file.editState() === 'patched' ? file.patchLineList() : null,
    }));
  let commitMessage = commitMessageTitle.value;
  if (commitMessageBody.value) commitMessage += `\n\n${commitMessageBody.value}`;
  if (skipCi.value) {
    commitMessage = `[ci-skip] ${commitMessage}`;
  }
  ungit.server
    .postPromise('/commit', {
      path: props.repoPath,
      message: commitMessage,
      _files,
      amend: amend.value,
      emptyCommit: emptyCommit.value,
    })
    .then(() => {
      resetMessages();
      skipCi.value = false;
      return ungit.server.postPromise('/push', {
        path: props.repoPath,
        remote: props.graph.currentRemote(),
      });
    })
    .catch((err) => {
      if (err.errorCode == 'non-fast-forward') {
        components.showModal('yesnomodal', {
          title: 'Force push?',
          details: "The remote branch can't be fast-forwarded.",
          closeFunc: (isYes) => {
            if (!isYes) return;
            ungit.server.postPromise('/push', {
              path: props.repoPath,
              remote: props.graph.currentRemote(),
              force: true,
            });
          },
        });
      } else {
        ungit.server.unhandledRejection(err);
      }
    });
}

const conflictResolution = (apiPath) => {
  let commitMessage = commitMessageTitle.value;
  if (commitMessageBody.value) commitMessage += `\n\n${commitMessageBody.value}`;
  ungit.server
    .postPromise(apiPath, { path: props.repoPath, message: commitMessage })
    .catch((e) => ungit.server.unhandledRejection(e))
    .finally(() => {
      resetMessages();
    });
}

const invalidateFilesDiffs = () => {
  files.value.forEach((file) => {
    file.diff().invalidateDiff();
  });
}

const invalidateFilesDiffsThrottled = _.throttle(invalidateFilesDiffs, 500, {
  leading: false,
  trailing: true,
});

const cancelAmendEmpty = () => {
  resetMessages();
}

const discardAllChanges = () => {
  components.showModal('yesnomodal', {
    title: 'Are you sure you want to discard all changes?',
    details: 'This operation cannot be undone.',
    closeFunc: (isYes) => {
      if (!isYes) return;
      ungit.server
        .postPromise('/discardchanges', { path: props.repoPath, all: true })
        .catch((e) => ungit.server.unhandledRejection(e));
    },
  });
}

const stashAll = () => {
  ungit.server
    .postPromise('/stashes', { path: props.repoPath, message: commitMessageTitle.value })
    .catch((e) => ungit.server.unhandledRejection(e));
}

const toggleAllStages = () => {
  const _allStageFlag = allStageFlag.value;
  for (const n in files.values) {
    files.value[n].editState(_allStageFlag ? 'staged' : 'none');
  }
}

const onEnter = (d, e) => {
  if (e.keyCode === 13 && !commitValidationError.value) {
    commit();
  }
  return true;
}

const onAltEnter = (d, e) => {
  if (e.keyCode === 13 && e.altKey && !commitValidationError.value) {
    commit();
  }
  return true;
}

programEvents.add((event) => {
  if (
    event.event == 'request-app-content-refresh' ||
    event.event === 'working-tree-changed' ||
    event.event === 'git-directory-changed'
  ) {
    refreshContent();
    invalidateFilesDiffs();
  }
});
</script>

<style scoped>
.staging {
  background: white;
  box-shadow: 0 -1px 15px #252833;
  color: #b8a5a5;
  z-index: 5;
  position: relative;

  .form-control {
    &:disabled {
      background-color: rgba(64, 36, 43, 0.75);
    }
  }

  textarea.commit-body {
    resize: vertical;
  }

  .arrow {
    border-top-color: white;
    left: ($log-width-small + 45px);
    bottom: -30px;
  }

  .commitnpush.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .file-area {
    position: relative;
  }

  .validationError {
    display: none;
    color: #d6542d;
    padding: 0.25em;
  }

  &:hover .validationError {
    display: inline-block;
  }

  .diffContainer {
    margin-top: 0;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  .discard {
    background: transparent;
    color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    padding: 3px;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;

    &:focus,
    &:hover {
      background: #000000;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .ignore {
    background: transparent;
    color: rgba(85, 85, 255, 0.3);
    border-radius: 3px;
    padding: 3px;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    font-weight: bold;

    &:focus,
    &:hover {
      background: #5555ff;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .patch {
    background: #279124;
    color: rgba(255, 255, 255, 0.9);
    border-radius: 3px;
    padding: 3px;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    font-weight: bold;

    &:focus,
    &:hover {
      background: #279124;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .d2h-code-line-prefix input[type='checkbox'] {
    margin: 0;
    margin-right: -5px;
    vertical-align: sub;
  }

  .files {
    position: relative;

    .file {
      padding: 0.3em;

      &.showingDiffs {
        .name {
          background: rgba(255, 255, 255, 0.1);
          color: black;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      .checkmark {
        span {
          top: 5px;
        }
      }

      .name {
        background: transparent;
        font-size: 1.3em;
        cursor: pointer;
        padding: 3px;
        border: 0;
        border-radius: 3px;
        color: rgba(0, 0, 0, 0.8);
      }

      .new,
      .deleted,
      .conflict,
      .markresolved,
      .launchmergetool {
        padding: 3px;
        padding-left: 5px;
        padding-right: 5px;
      }

      .new,
      .additions {
        color: #949494;
        vertical-align: middle;
      }

      .deleted,
      .deletions {
        color: #7b7b7b;
        vertical-align: middle;
      }

      .conflict {
        color: #db12c0;

        .explanation {
          display: none;
        }

        &:hover {
          .explanation {
            display: inline;
          }

          .temporary {
            display: none;
          }
        }
      }

      .markresolved {
        color: #db12c0;
        cursor: pointer;

        .explanation {
          display: none;
        }

        &:hover {
          background: #a445ed;
          color: #000000;
          border-radius: 3px;

          .explanation {
            display: inline;
          }
        }
      }

      .launchmergetool {
        color: #db55ff;
        cursor: pointer;

        .explanation {
          display: none;
        }

        &:hover {
          background: #a477ff;
          color: #000000;
          border-radius: 3px;

          .explanation {
            display: inline;
          }
        }
      }
    }
  }
}

@media (min-width: $screen-md-min) {
  .staging {
    .arrow {
      left: ($log-width-large + 45px);
    }
  }
}

.commit-message-title-counter {
  right: 20px;
  position: absolute;
}

.amend-button {
  padding: 0;

  &:active,
  &:focus,
  &:hover {
    text-decoration: none;
  }
}

.checkmark {
  display: inline-block;
  opacity: 0.3;
  cursor: pointer;

  &.checked {
    opacity: 0.8;
  }
}
</style>