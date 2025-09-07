<template>
    <div class="textdiff">
      <div v-if="isParsed"
        v-html="htmlSrc"
        :class="{ d2hwordwrap: wordWrap }"
      ></div>
      <div class="load-more" v-if="hasMore">
        <button class="btn btn-default" @click.prevent="loadMore">Load more</button>
      </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { parse as d2h_parse, html as d2h_html } from 'diff2html';

defineOptions({
  name: 'TextDiff'
})

const props = defineProps([
    'repoPath',
    'filename',
    'oldFileName',
    'repoPath',
    'sha1',
    'textDiffType',
    'isShowingDiffs',
    'whiteSpace',
    'wordWrap',
])

const hasMore = ref(false);
const loadLimit = 100;
const loadCount = ref(loadLimit);

const numberOfSelectedPatchLines = ref(0);
const patchLineList = ref([]);

const htmlSrc = ref('');
const isParsed = ref(false);

var diffJson;

const getDiffArguments = () => {
    return {
        file: props.filename,
        oldFile: props.oldFileName,
        path: props.repoPath,
        sha1: props.sha1 ? props.sha1 : '',
        whiteSpace: props.whiteSpace,
    };
}


const getDiffJson = () => {
    return ungit.server
      .getPromise('/diff', getDiffArguments())
      .then((diffs) => {
        if (typeof diffs !== 'string') {
          // Invalid value means there is no changes, show dummy diff without any changes
          diffs = `diff --git a/${this.filename} b/${this.filename}
                  index aaaaaaaa..bbbbbbbb 111111
                  --- a/${this.filename}
                  +++ b/${this.filename}`;
        }
        diffJson = d2h_parse(diffs);
      })
      .catch((err) => {
        // The file existed before but has been removed, but we're trying to get a diff for it
        // Most likely it will just disappear with the next refresh of the staging area
        // so we just ignore the error here
        if (err.errorCode != 'no-such-file') {
          ungit.server.unhandledRejection(err);
        } else {
          ungit.logger.warn('diff, no such file', err);
        }
      });
}

const render = () => {
    return (!diffJson ? getDiffJson() : Promise.resolve()).then(() => {
        if (!diffJson || diffJson.length == 0) return; // check if diffs are available (binary files do not support them)

        if (!diffJson[0].allBlocks) {
            diffJson[0].allBlocks = diffJson[0].blocks;
        }

        const currentLoadCount = Math.max(loadCount, loadLimit);
        let _lineCount = 0;
        let _loadCount = 0;
        diffJson[0].blocks = diffJson[0].allBlocks.reduce((blocks, block) => {
            const length = block.lines.length;
            const remaining = currentLoadCount - _lineCount;
            if (remaining > 0) {
                _loadCount += length;
                blocks.push(block);
            }
            _lineCount += length;
            return blocks;
        }, []);

        loadCount.value = _loadCount;
        hasMore.value = _lineCount > _loadCount;

        let html = d2h_html(diffJson, {
            outputFormat:
                props.textDiffType === 'SideBySide' ? 'side-by-side' : 'line-by-line',
            drawFileList: false,
        });

        numberOfSelectedPatchLines.value = 0;
        let index = 0;

        // ko's binding resolution is not recursive, which means below ko.bind refresh method doesn't work for
        // data bind at getPatchCheckBox that is rendered with "html" binding.
        // which is reason why manually updating the html content and refreshing kobinding to have it render...
        if (patchLineList) {
            html = html.replace(/<span class="d2h-code-line-prefix">(\+|-)/g, (match, capture) => {
                if (patchLineList[index] === undefined) {
                    patchLineList[index] = true;
                }

                return this.getPatchCheckBox(capture, index, patchLineList[index++]);
            });
        }

        if (html !== htmlSrc.value) {
            // diff has changed since last we displayed and need refresh
            htmlSrc.value = html;
            isParsed.value = false;
            isParsed.value = true;
        }
    });
}

const loadMore = () => {
    loadCount += loadLimit;
    render();
}

watchEffect(() => {
    render();
});

</script>

<style scoped>
.d2hwordwrap {
    word-wrap: true
}
</style>