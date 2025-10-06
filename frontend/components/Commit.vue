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
          onerror="this.style.display='none';"
        />
        <div>
          <div>
            <span
              class="title"
              data-bind="text: (title().length > 72 ? title().substring(0, 72) + '...' : title)"
            ></span>
            <span class="text-muted"
              >by <a data-bind="text: authorName, attr: { href: 'mailto:' + authorEmail() }"></a
            ></span>
            <!-- ko if: pgpVerifiedString() -->
            <span
              class="text-muted"
              data-bind="html: pgpIcon, attr: { title: pgpVerifiedString() }"
              data-toggle="tooltip"
            ></span>
            <!-- /ko -->
          </div>
          <div class="text-muted nodeSummaryContainer">
            <span
              class="badge-outline"
              data-bind="attr: { 'title': authorDate }"
              data-side="bottom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path></svg>
              <span data-bind="text: authorDateFromNow"></span>
            </span>
            <span class="badge-outline">
              +<span data-bind="text: numberOfAddedLines"></span>, -<span
              data-bind="text: numberOfRemovedLines"
            ></span></span>
            <div class="badge-outline">
              <span data-bind="html: gitCommitIcon"></span>
              <span title="Commit" data-bind="text: sha1.substring(0, 8)"></span>
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

defineOptions({
    name: 'Commit',
});

const authorEmail = ref('');
const authorName = ref('');

const authorGravatar = computed(() => {
    const email = authorEmail.value || '';
    return md5(email.trim().toLowerCase());
});

const props = defineProps(['gitNode']);

const _setData = (args) => {
    const message = args.message.split('\n');
    // this.message(args.message);
    // this.title(message[0]);
    // this.body(message.slice(message[1] ? 1 : 2).join('\n'));
    // this.authorDate(moment(new Date(args.authorDate)));
    // this.authorDateFromNow(this.authorDate().fromNow());
    authorName.value = args.authorName;
    authorEmail.value = args.authorEmail;
    // this.numberOfAddedLines(args.additions);
    // this.numberOfRemovedLines(args.deletions);
    // this.parents(args.parents || []);
    // this.fileLineDiffs(args.fileLineDiffs);
    // this.commitDiff = ko.observable(
    //   components.create('commitDiff', {
    //     fileLineDiffs: this.fileLineDiffs(),
    //     sha1: this.sha1,
    //     repoPath: this.repoPath,
    //     server: this.server,
    //     showDiffButtons: this.selected,
    //   })
    // );
}

defineExpose({
    _setData
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