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
</template>

<script setup>
defineProps(['branch']);
</script>