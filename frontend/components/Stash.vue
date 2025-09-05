<template>
    <div class="stash-toggle stash-toggle-text border" v-show="stashedChanges.length > 0 && !visible" @click="toggleShowStash" data-aid="show-stashes">
      <Octicon class="expand-icon" name="chevron-right" />
      Stash (<span data-bind="text: stashedChanges().length"></span>)
    </div>
    <div class="panel panel-default stash" v-show="stashedChanges.length > 0 && visible">
      <div class="panel-body">
        <h4 class="stash-toggle-text" @click="toggleShowStash">
          <Octicon class="expand-icon" name="chevron-down" />
          Stashed changes (<span data-bind="text: stashedChanges().length"></span>)
        </h4>
        <div class="list-group" data-bind="foreach: stashedChanges">
          <div class="list-group-item" data-aid="stash-item">
            <a
              href="#"
              class="stash-apply octicon-circled"
              data-bind="html: applyIcon, click: apply"
              data-toggle="tooltip"
              data-aid="apply-stash"
              title="Apply this stash"
            ></a>
            <a
              href="#"
              class="toggle-show-commit-diffs"
              data-bind="click: toggleShowCommitDiffs"
              data-toggle="tooltip"
              data-aid="show-stash-diff"
              title="Show stash diff"
            >
              <h4 class="list-group-item-heading" data-bind="text: title"></h4>
              <p class="list-group-item-text" data-bind="text: message"></p>
            </a>
            <!-- ko if: showCommitDiff() -->
            <div class="diff-wrapper">
              <div class="diff-inner" data-bind="component: commitDiff"></div>
            </div>
            <!-- /ko -->
            <button
              type="button"
              class="btn btn-default list-item-remove"
              data-bind="html: dropIcon, click: drop"
              data-toggle="tooltip"
              data-aid="delete-stash"
              title="Drop this stash"
            ></button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import storage from '/source/js/storage.js';

defineOptions({
  name: 'Stash'
})

const visible = ref(storage.getItem('showStash') === 'true');

const toggleShowStash = () => {
    visible.value = !visible.value;
    storage.setItem('showStash', visible.value);
};

const stashedChanges = ref([]);


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
