<template>
  <div class="file">
    <div class="head commit-diff-filename" @click.prevent="showDiff = !showDiff">
      <span> {{ commitLineDiff.displayName }}</span>
      <span class="file-stats" v-if="commitLineDiff.additions != '-'">
        (<span>{{ commitLineDiff.additions }}</span><span>{{ commitLineDiff.deletions }}</span>)
      </span>
    </div>
    <FileDiff class="diffContainer commit-file-diff" :fileType="commitLineDiff.type" :showDiff="showDiff"
        :repoPath="repoPath"
        :filename="commitLineDiff.fileName"
        :oldFileName="commitLineDiff.oldFileName"
        :sha1="sha1"
        :textDiffType="textDiff"
        :isShowingDiffs="showDiff"
        :whiteSpace="showWhiteSpace"
        :wordWrap="wordWrap"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
  name: 'CommitLineDiff'
})

const showDiff = ref(false);

const props = defineProps(['commitLineDiff', 'repoPath', 'sha1', 'textDiff', 'showWhiteSpace', 'wordWrap']);

</script>