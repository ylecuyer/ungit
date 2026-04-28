<template>
  <path stroke="#4A4A4A" stroke-width="8" :d="d" />
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
    name: 'Edge',
});

const props = defineProps(['edge', 'nodesById']);

const nodeA = computed(() => {
  return props.nodesById[props.edge.nodeAsha1];
});
const nodeB = computed(() => {
  return props.nodesById[props.edge.nodeBsha1];
});

const d = computed(() => {
  if (!nodeA.value || !nodeB.value) return '';
  return `M ${nodeA.value.cx} ${nodeA.value.cy} L ${nodeB.value.cx} ${nodeB.value.cy}`;
});

</script>

<style scoped></style>