<template>
    <div v-if="showDiff">
        <ImageDiff v-if="fileType === 'image'"
            :filename="filename"
            :oldFileName="oldFileName"
            :repoPath="repoPath"
            :sha1="sha1"
            :textDiffType="textDiffType"
            :isShowingDiffs="isShowingDiffs"
            :whiteSpace="whiteSpace"
            :wordWrap="wordWrap"
        />
        <TextDiff v-else
            :filename="filename"
            :oldFileName="oldFileName"
            :repoPath="repoPath"
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

defineProps([
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