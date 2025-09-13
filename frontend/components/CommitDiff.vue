<template>
    <div>
        <div class="flex gap-2" v-if="showDiffButtons">
          <div class="btn-group btn-group-xs">
            <button
              class="btn-outline commit-whitespace"
              @click.prevent="showWhiteSpace = !showWhiteSpace"
              :class="{ active: showWhiteSpace }"
              data-tooltip="Hide whitespace changes in diff"
              data-side="bottom"
            >
              <span v-text="showWhiteSpace ? 'Show Whitespace' : 'Hide Whitespace'"></span>
            </button>
          </div>
          <div class="btn-group btn-group-xs">
            <button
              class="btn-outline commit-sideBySideDiff"
                @click.prevent="textDiff = textDiff === 'textdiff' ? 'sidebysidediff' : 'textdiff'"
              :class="{ active: textDiff === 'sidebysidediff' }"
              data-tooltip="Show side by side diff view"
              data-side="bottom"
            >
              <span v-text="textDiff === 'sidebysidediff' ? 'Side by Side' : 'Inline'"></span>
            </button>
          </div>
          <div class="btn-group btn-group-xs">
            <button
              class="btn-outline commit-wordwrap"
              @click.prevent="wordWrap = !wordWrap"
              :class="{ active: wordWrap }"
              data-tooltip="Wrap words per line"
              data-side="bottom"
            >
              <span v-text="wordWrap ? 'Wrap Lines' : 'No Wrap'"></span>
            </button>
          </div>
        </div>

        <div v-for="commitLineDiff in commitLineDiffs" class="commitdiff">
            <CommitLineDiff :commitLineDiff="commitLineDiff" :repoPath="repoPath" :sha1="sha1"
                :textDiff="textDiff"
                :showWhiteSpace="showWhiteSpace"
                :wordWrap="wordWrap" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
  name: 'CommitDiff'
})

defineProps(['showDiffButtons', 'commitLineDiffs', 'repoPath', 'sha1']);

const showDiff = ref(false);

const showWhiteSpace = ref(false);
const wordWrap = ref(false);
const textDiff = ref('textdiff');
</script>

<style>
.commitdiff {
  width: 100%;

  .file {
    margin-top: 5px;
    border-radius: 3px;

    .head {
      display: block;
      cursor: pointer;
      padding: 3px;
      padding-left: 6px;
      padding-right: 6px;
      color: black;
      background: var(--d2h-file-header-bg-color);
      word-wrap: break-word;

      .file-stats {
        span:nth-of-type(1)::before {
          content: '+';
        }

        span:nth-of-type(2)::before {
          content: ', -';
        }
      }
    }

    .diff {
      background: rgba(0, 0, 0, 0.11);

      .textDiff {
        color: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.loadMore {
  .btn {
    display: block;
    margin: 20px 20px 10px 20px;
  }
}
</style>