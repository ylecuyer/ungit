import { ref, computed } from 'vue';

let modalIdCounter = 0;

export default function useModals() {
  const modals = ref([]);

  /**
   * Open a modal and add it to the stack
   * @param {Object} modalData - Modal configuration
   * @param {string} modalData.type - Modal type: 'form' or 'prompt'
   * @param {string} modalData.title - Modal title
   * @param {*} modalData.data - Modal-specific data (varies by type)
   * @param {Function} modalData.onClose - Callback when modal closes
   * @returns {string} Modal ID for reference
   */
  const openModal = (modalData) => {
    if (!modalData) {
      console.error('Modal data is undefined');
      return null;
    }
    const id = `modal-${modalIdCounter++}`;
    const modalObject = {
      id,
      ...modalData,
    };
    if (!modalObject.type) {
      console.error('Modal type is missing', modalObject);
      return null;
    }
    modals.value.push(modalObject);
    return id;
  };

  /**
   * Close and remove a modal by ID
   */
  const closeModal = (id) => {
    const index = modals.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      modals.value.splice(index, 1);
    }
  };

  /**
   * Show a form modal (credentials, add remote, add submodule, etc.)
   * @param {Object} config
   * @param {string} config.type - Form type: 'credentials', 'addRemote', 'addSubmodule'
   * @param {string} config.title - Dialog title
   * @param {Array} config.items - Form items [{name, value, type, autoFocus}, ...]
   * @param {boolean} [config.showCancel] - Show cancel button (default: true)
   * @param {Function} config.onSubmit - Called with form data on submit
   * @param {Function} [config.onClose] - Called when modal closes
   */
  const showFormModal = (config) => {
    return openModal({
      type: 'form',
      formType: config.type,
      title: config.title,
      items: config.items,
      showCancel: config.showCancel !== false,
      onSubmit: config.onSubmit,
      onClose: config.onClose,
    });
  };

  /**
   * Show a prompt modal (yes/no dialogs, confirmations, etc.)
   * @param {Object} config
   * @param {string} config.type - Prompt type: 'yesno', 'yesnoMute', 'tooManyFiles'
   * @param {string} config.title - Dialog title
   * @param {string} config.details - Dialog details/description
   * @param {Array} config.options - Button options [{label, primary, taId, callback}, ...]
   * @param {Function} [config.onClose] - Called when modal closes
   */
  const showPromptModal = (config) => {
    return openModal({
      type: 'prompt',
      promptType: config.type,
      title: config.title,
      details: config.details,
      options: config.options,
      onClose: config.onClose,
    });
  };

  /**
   * Show a credentials modal
   * @param {string} remote - Remote name
   * @param {Function} onSubmit - Called with {username, password}
   */
  const showCredentialsModal = (remote, onSubmit) => {
    return showFormModal({
      type: 'credentials',
      title: `Remote ${remote} requires authentication`,
      items: [
        { name: 'Username', value: '', type: 'text', autoFocus: true },
        { name: 'Password', value: '', type: 'password', autoFocus: false },
      ],
      showCancel: false,
      onSubmit: (values) => {
        onSubmit({
          username: values[0],
          password: values[1],
        });
      },
    });
  };

  const activeFormModals = computed(() => 
    modals.value.filter((m) => m && m.type === 'form')
  );
  const activePromptModals = computed(() => 
    modals.value.filter((m) => m && m.type === 'prompt')
  );

  return {
    modals,
    activeFormModals,
    activePromptModals,
    openModal,
    closeModal,
    showFormModal,
    showPromptModal,
    showCredentialsModal,
  };
}
