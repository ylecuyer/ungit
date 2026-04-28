<template>
  <dialog v-if="modal" ref="dialogRef" class="dialog w-full sm:max-w-[425px] max-h-[612px]" @click="closeIfClickedOutside">
    <article>
      <header>
        <h2>{{ modal?.title }}</h2>
      </header>

      <!-- Autocomplete is off because of https://github.com/FredrikNoren/ungit/issues/363 -->
      <form class="form p-10" @submit.prevent="handleSubmit" autocomplete="off">
        <section>
          <div class="grid gap-6">
            <div v-for="(item, index) in (modal?.items || [])" :key="index" class="grid gap-2">
              <label :for="`input-${index}`">{{ item?.name }}</label>
              <input
                :id="`input-${index}`"
                v-model="formValues[index]"
                :type="item?.type"
                :autofocus="item?.autoFocus"
              />
            </div>
          </div>
        </section>

        <footer>
          <button
            v-if="modal?.showCancel"
            type="button"
            class="btn-outline"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn"
            data-aid="form-modal-submit"
          >
            Submit
          </button>
        </footer>
      </form>

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
  name: 'FormModal',
});

const props = defineProps({
  modal: {
    type: Object,
    default: null,
    // {id, type, formType, title, items, showCancel, onSubmit, onClose}
  },
  closeModal: {
    type: Function,
    required: false,
    default: () => {},
  },
});

const dialogRef = ref(null);
const formValues = ref([]);

watch(
  () => props.modal,
  (newModal) => {
    if (newModal && newModal.items) {
      formValues.value = newModal.items.map((item) => item.value || '');
      nextTick(() => {
        dialogRef.value?.showModal?.();
      });
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (props.modal?.onSubmit) {
    props.modal.onSubmit(formValues.value);
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
    if (props.modal?.showCancel) {
      handleClose();
    }
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
</style>
