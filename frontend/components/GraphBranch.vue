<template>
  <span
    class="ref branch"
    draggable="true"
    tabIndex="-1"
    data-aid="branch"
    :data-ta-name="branch.localRefName"
    :data-ta-local="branch.isLocal"
    v-html="branch.displayHtml(true)"
    :class="{
      current: branch.current(),
      remote: branch.isRemoteBranch,
      dragging: branch.isDragging(),
      focused: branch.selected(),
    }"
    @click="branch.selected(branch)"
    @dblclick="branch.checkout()"
    @dragstart="branch.dragStart()"
    @dragend="branch.dragEnd()"
  />
  <button
    v-if="branch.selected() && branch.isLocalBranch"
    class="graphAction push"
    type="button"
    data-aid="push-branch-btn"
    @click.stop="branch.push()"
  >Push</button>
  <button
    v-if="branch.selected()"
    class="graphAction reset"
    type="button"
    data-aid="reset-branch-btn"
    @click.stop="branch.reset()"
  >Reset</button>
  <button
    v-if="branch.selected() && branch.isLocalBranch"
    class="graphAction squash"
    type="button"
    data-aid="squash-branch-btn"
    @click.stop="branch.squash()"
  >Squash</button>
</template>

<script setup>
defineProps(['branch']);
</script>