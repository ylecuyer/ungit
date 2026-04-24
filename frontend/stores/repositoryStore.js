import { defineStore } from 'pinia';

export const useRepositoryStore = defineStore('repository', {
    state: () => ({
        nodes: [],
        edges: [],
    })
});