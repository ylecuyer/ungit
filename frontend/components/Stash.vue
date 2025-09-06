<template>
    <div class="stash-toggle stash-toggle-text border" v-show="stashedChanges.length > 0 && !visible" @click="toggleShowStash" data-aid="show-stashes">
      <Octicon class="expand-icon" name="chevron-right" />
      Stash ({{  stashedChanges.length }})
    </div>
    <div class="panel panel-default stash" v-show="stashedChanges.length > 0 && visible">
      <div class="panel-body">
        <h4 class="stash-toggle-text" @click="toggleShowStash">
          <Octicon class="expand-icon" name="chevron-down" />
          Stashed changes ({{ stashedChanges.length }})
        </h4>
        <div class="list-group" v-for="stash in stashedChanges" :key="stash.sha1">
            <StashItem :stash="stash" :repoPath="repoPath" />
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import storage from '/source/js/storage.js';
import programEvents from '/source/js/program-events.js';
import { repo } from '@primer/octicons';

defineOptions({
  name: 'Stash'
})

const props = defineProps(['repoPath']);

const visible = ref(storage.getItem('showStash') === 'true');

const toggleShowStash = () => {
    visible.value = !visible.value;
    storage.setItem('showStash', visible.value);
};

const stashedChanges = ref([]);

programEvents.add((event) => {
    if (event.event == 'request-app-content-refresh' || event.event == 'git-directory-changed') {
      _refresh();
    }
});

const _refresh = async () => {
    console.warn('stash.refresh() triggered');
    ungit.logger.debug('stash.refresh() triggered');

    try {
        const stashes = await ungit.server.getPromise('/stashes', { path: props.repoPath });
        /* TODO put back cache 
        if (this.isSamePayload(stashes)) {
            return;
        }*/

        let changed = stashedChanges.value.length != stashes.length;
        if (!changed) {
            changed = !stashedChanges.value.every((item1) =>
                stashes.some((item2) => item1.sha1 == item2.sha1)
            );
        }

        if (changed) {
            stashedChanges.value = stashes;
        }
    } catch (err) {
        if (err.errorCode != 'no-such-path') {
            ungit.server.unhandledRejection(err);
        } else {
            ungit.logger.warn('refresh failed: ', err);
        }
    } finally {
        ungit.logger.debug('stash.refresh() finished');
    }
}
</script>

<style>
.stash {
  z-index: 4;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: -15px;

  h4 {
    margin-top: 0;
  }

  .toggle-show-commit-diffs {
    display: inline-block;
  }

  .diff-wrapper {
    margin-top: 5px;
  }
}

.stash-toggle {
  width: 120px;
  height: 30px;
  position: relative;
  left: 20px;
  border-radius: 5px 5px 0 0;
  padding-top: 5px;
  text-align: center;
}

.stash-toggle-text {
  cursor: pointer;
}

.expand-icon {
  opacity: 0.5;
}

.stash-apply .octicon {
  vertical-align: middle;
}
</style>
