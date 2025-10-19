<template>
<div
  class="commit"
  data-bind="css: { highlighted: highlighted, hover: nodeIsMousehover, selected: selected }"
>
  <div
    class="commit-box panel panel-default"
    data-bind="element: element, click: stopClickPropagation"
  >
    <div class="panel-body">
      <div class="arrow shadow"></div>
      <div class="arrow"></div>
      <div class="flex gap-2 items-center">
        <img
          class="size-15 shrink-0 object-cover rounded-full"
          :src="`/api/avatar?email=${authorEmail}`"
          :alt="`Profile Picture of ${authorName}`"
        />
        <div>
          <div>
            <span
              class="title"
              v-text="title.length > 72 ? title.substring(0, 72) + '...' : title"
            ></span>
            <span class="text-muted"
              >by <a :href="`mailto:${authorEmail}`">{{ authorName }}</a
            ></span>
            <span v-if="pgpVerifiedString"
              class="text-muted"
              :title="pgpVerifiedString"
              data-toggle="tooltip"
            >
                <octicon name="verified" />
          </span>
          </div>
          <div class="text-muted nodeSummaryContainer">
            <span
              class="badge-outline"
              :title="authorDate"
              data-side="bottom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path></svg>
              <span v-text="authorDateFromNow"></span>
            </span>
            <span class="badge-outline">
              +<span v-text="numberOfAddedLines"></span>, -<span
              v-text="numberOfRemovedLines"
            ></span></span>
            <div class="badge-outline">
              <Octicon name="git-commit" />
              <span title="Commit" v-text="sha1.substring(0, 8)"></span>
            </div>
          </div>
        </div>
      </div>
      <!-- ko if: selected() || nodeIsMousehover() -->
      <div class="details">
        <div
          class="body"
          data-bind="visible: title().length > 72, text: '...' + title().substring(72)"
        ></div>
        <div class="body" data-bind="text: body, visible: body"></div>
        <div
          class="diff-wrapper"
          data-bind="visible: showCommitDiff, style: diffStyle, click: stopClickPropagation"
        >
          <div class="diff-inner" data-bind="component: commitDiff"></div>
        </div>
      </div>
      <!-- /ko -->
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, computed } from 'vue';
import moment from 'moment';
import Octicon from './Octicon.vue';

defineOptions({
    name: 'Commit',
});

const authorEmail = ref('');
const authorName = ref('');

const authorGravatar = computed(() => {
    const email = authorEmail.value || '';
    return md5(email.trim().toLowerCase());
});

const props = defineProps(['gitNode', 'sha1', 'pgpVerifiedString', 'repoPath', 'server', 'showDiffButtons']);
const message = ref('');
const title = ref('');
const body = ref('');
const authorDate = ref(null);
const authorDateFromNow = ref('');
const numberOfAddedLines = ref(0);
const numberOfRemovedLines = ref(0);
const parents = ref([]);
const fileLineDiffs = ref([]);
const commitDiff = ref(null);

const _setData = (args) => {
  const message = args.message.split('\n');
  message.value = args.message;
  title.value = message[0];
  body.value = message.slice(message[1] ? 1 : 2).join('\n');
  authorDate.value = moment(new Date(args.authorDate));
  authorDateFromNow.value = authorDate.value.fromNow();
  authorName.value = args.authorName;
  authorEmail.value = args.authorEmail;
  numberOfAddedLines.value = args.additions;
  numberOfRemovedLines.value = args.deletions;
  parents.value = args.parents || [];
  fileLineDiffs.value = args.fileLineDiffs || [];
  commitDiff.value = {
    fileLineDiffs: fileLineDiffs.value,
    sha1: props.sha1,
    repoPath: props.repoPath,
    server: props.server,
    showDiffButtons: props.showDiffButtons,
  }
}

const lastUpdatedAuthorDateFromNow = ref(0);
const _updateLastAuthorDateFromNow = (deltaT) => {
  lastUpdatedAuthorDateFromNow.value = lastUpdatedAuthorDateFromNow.value || 0;
  lastUpdatedAuthorDateFromNow.value += deltaT;
  if (lastUpdatedAuthorDateFromNow.value > 60 * 1000) {
    lastUpdatedAuthorDateFromNow.value = 0;
    authorDateFromNow.value = authorDate.value.fromNow();
  }
};

defineExpose({
    _setData, _updateLastAuthorDateFromNow
})

</script>

<style>
.commit {
  position: relative;

  &.highlighted {
    z-index: 2;

    .commit-box {
      box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.2);
      background: white;
      left: -5px;

      .arrow {
        border-left-color: white;

        &.shadow {
          display: block;
        }
      }
    }
  }

  &.hover {
    z-index: 3;
  }

  &.selected {
    .details {
      .diff-wrapper {
        margin-bottom: 5px;
        transition: width 0.1s, left 0.05s;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);

        .diff-inner {
          box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.2);
          padding: 10px;
          padding-top: 0;
        }

        .btn-group {
          margin-top: 10px;
        }
      }
    }
  }

  .commit-box {
    background-color: var(--color-sidebar-accent) !important;
    .arrow {
      right: -30px;
      top: 27px;
      border-left-color: white;

      &.shadow {
        display: none;
        right: -34px;
        top: 32px;
        border-left-color: rgba(0, 0, 0, 0.2);
      }
    }
  }

  .commit-box > .panel-body {
    position: relative;
    padding: 10px;
    margin-bottom: 0;
    width: 400px;
    min-height: 85px;

    .gravatar {
      display: none;
      margin-right: 10px;
    }

    .title {
      font-size: 1.3em;
      word-wrap: break-word;
      display: block;
    }

    .details {
      .body {
        font-family: 'Source Code Pro', monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #8f9fa6;
      }

      .diff-wrapper {
        margin-top: 10px;
        background: white;
        border-radius: 3px;
      }
    }
  }
}

@media (min-width: 150px) {
  .commit {
    .commit-box > .panel-body {
      width: 550px;

      .gravatar {
        display: block;
      }
    }
  }
}
</style>