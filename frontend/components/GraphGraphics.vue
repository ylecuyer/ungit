<template>
    <svg
    class="graphLog"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    :width="graphWidth"
    :height="graphHeight"
    >
    <defs>
        <marker
        id="rebaseArrowEnd"
        viewBox="0 0 10 10"
        refX="0"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="4"
        markerHeight="3"
        orient="auto"
        >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#22252E" />
        </marker>
        <marker
        id="pushArrowEnd"
        viewBox="0 0 10 10"
        refX="0"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="4"
        markerHeight="3"
        orient="auto"
        >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(61, 139, 255)" />
        </marker>
    </defs>
    <g>
        <g v-if="commitNodeEdge"
        class="load-ahead-button"
        :opacity="commitOpacity"
        @click="loadAhead"
        >
            <path
                :d="commitNodeEdge"
                stroke="#4A4A4A"
                stroke-width="8"
                stroke-dasharray="10, 5"
            />
            <circle
                :stroke="commitNodeColor"
                cx="610"
                cy="35"
                r="30"
                stroke-dasharray="10, 7"
                stroke-width="10"
                fill="transparent"
            />
            <circle v-if="skip > 0"
                class="loadAhead"
                :fill="commitNodeColor"
                cx="610"
                cy="35"
                r="15"
            />
        </g>

        <Edge v-for="edge in edges" :key="edge.id" :edge="edge" :nodesById="nodesById" />

        <Node
            v-for="node in nodes"
            :key="node.sha1"
            :r="node.r"
            :color="node.ideologicalBranch ? node.ideologicalBranch.color : '#666'"
            :isNodeAccented="node.isNodeAccented()"
            :cx="node.cx"
            :cy="node.cy"
            :selected="node.selected"
            @toggle="emit('toggle-node', node)"
        />
    </g>
    </svg>
</template>

<script setup>
import { computed } from 'vue';

defineOptions({
  name: 'GraphGraphics',
});

const emit = defineEmits(['toggle-node']);

const props = defineProps(['graphWidth', 'graphHeight', 'commitNodeEdge', 'commitNodeColor', 'commitOpacity', 'loadAhead', 'skip', 'nodes', 'edges']);

const nodesById = computed(() => {
    const byId = {};
    (props.nodes || []).forEach((node) => {
        byId[node.sha1] = node;
    });
    return byId;
});
</script>