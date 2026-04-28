<template>
  <dialog v-if="modal" ref="dialogRef" class="dialog w-full sm:max-w-[425px] max-h-[612px]" @click="closeIfClickedOutside">
    <article>
      <header>
        <h2>{{ modal?.title }}</h2>
      </header>

      <section>
        <p v-html="modal?.details"></p>
      </section>

      <footer>
        <button
          v-for="(option, index) in (modal?.options || [])"
          :key="index"
          type="button"
          :class="option?.primary ? 'btn' : 'btn-outline'"
          :data-ta-action="option?.taId"
          @click="handleOptionClick(option)"
        >
          {{ option?.label }}
        </button>
      </footer>

      <button
        type="button"
        aria-label="Close dialog"
        @click="handleClose"
        class="absolute top-4 right-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </article>
  </dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

defineOptions({
  name: 'PromptModal',
});

const props = defineProps({
  modal: {
    type: Object,
    default: null,
    // {id, type, promptType, title, details, options, onClose}
  },
  closeModal: {
    type: Function,
    required: false,
    default: () => {},
  },
});

const dialogRef = ref(null);

watch(
  () => props.modal,
  (newModal) => {
    if (newModal) {
      nextTick(() => {
        dialogRef.value?.showModal?.();
      });
    }
  },
  { immediate: true }
);

const handleOptionClick = (option) => {
  if (option?.callback) {
    option.callback();
  }
  handleClose();
};

const handleClose = () => {
  dialogRef.value?.close?.();
  if (props.modal?.onClose) {
    props.modal.onClose();
  }
  if (props.closeModal && props.modal?.id) {
    props.closeModal(props.modal.id);
  }
};

const closeIfClickedOutside = (event) => {
  if (event.target === dialogRef.value) {
    handleClose();
  }
};
</script>

<style scoped>
dialog {
  position: relative;
}

.absolute {
  position: absolute;
}

.top-4 {
  top: 1rem;
}

.right-4 {
  right: 1rem;
}

footer {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
