<template>
    <div v-if="showDiff">
        <ImageDiff v-if="fileType === 'image'"
            :repoPath="repoPath"
            :filename="filename"
            :oldFileName="oldFileName"
            :sha1="sha1"
            :textDiffType="textDiffType"
            :isShowingDiffs="isShowingDiffs"
            :whiteSpace="whiteSpace"
            :wordWrap="wordWrap"
        />
        <TextDiff v-else
            :repoPath="repoPath"
            :filename="filename"
            :oldFileName="oldFileName"
            :sha1="sha1"
            :textDiffType="textDiffType"
            :isShowingDiffs="isShowingDiffs"
            :whiteSpace="whiteSpace"
            :wordWrap="wordWrap"
        />
    </div>
</template>

<script setup>
defineOptions({
  name: 'FileDiff'
})

const props = defineProps([
    'repoPath',
    'showDiff',
    'fileType',
    'filename',
    'oldFileName',
    'repoPath',
    'sha1',
    'textDiffType',
    'isShowingDiffs',
    'whiteSpace',
    'wordWrap',
])
</script>