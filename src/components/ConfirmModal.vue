<script setup>
defineProps({
  title: { type: String, required: true },
  body: { type: String, required: true },
  cancelText: { type: String, required: true },
  confirmText: { type: String, required: true },
  danger: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div class="modal">
    <h3>{{ title }}</h3>
    <p class="note">{{ body }}</p>
    <div class="modal-actions">
      <button @click="emit('cancel')">{{ cancelText }}</button>
      <button
        :style="danger ? 'background:var(--danger);border-color:var(--danger);color:#fff' : ''"
        @click="emit('confirm')"
      >
        {{ confirmText }}
      </button>
    </div>
  </div>
</template>
