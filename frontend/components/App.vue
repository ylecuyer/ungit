<template>
  <div>
    <Sidebar />
    <Header />

    <div class="app">
      <RouterView class="container-fluid" />
    </div>

    <FormModal
      v-for="modal in (modalStore?.activeFormModals || [])"
      v-if="modal"
      :key="modal?.id"
      :modal="modal"
      :closeModal="modalStore?.closeModal"
    />
    <PromptModal
      v-for="modal in (modalStore?.activePromptModals || [])"
      v-if="modal"
      :key="modal?.id"
      :modal="modal"
      :closeModal="modalStore?.closeModal"
    />
  </div>
</template>

<script setup>
import { inject } from 'vue';
import FormModal from './modals/FormModal.vue';
import PromptModal from './modals/PromptModal.vue';

defineOptions({
    name: 'App',
});

const props = defineProps(['server']);
const modalStore = inject('modalStore', null);
</script>

<style>
.app {
  margin-top: 15px;
  margin-left: var(--sidebar-width);

  .container-fluid {
    padding-left: 40px;
    padding-right: 40px;
  }
}
</style>