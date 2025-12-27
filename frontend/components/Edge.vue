<template>
    <path data-bind="event: { mouseover: edgeMouseOver, mouseout: edgeMouseOut }"
        ref="element" stroke="#4A4A4A" stroke-width="8" :d="d"/>
</template>

<script setup>
import { ref, computed } from 'vue';

defineOptions({
    name: 'Edge',
});

const props = defineProps(['nodeAsha1', 'nodeBsha1', 'getNode']);

const element = ref(null);
const nodeA = computed(() => {
  return props.getNode(props.nodeAsha1);
});
const nodeB = computed(() => {
  return props.getNode(props.nodeBsha1);
});

const d = computed(() => {
  if (!nodeA.value || !nodeB.value) return '';
  return `M ${nodeA.value.cx()} ${nodeA.value.cy()} L ${nodeB.value.cx()} ${nodeB.value.cy()}`;
});

</script>

<style scoped></style>