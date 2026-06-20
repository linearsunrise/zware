<template>
  <div class="formula-editor">
    <div class="formula-editor__header">
      <span class="formula-editor__label">Formula</span>
      <div class="formula-editor__mode-tabs">
        <button class="formula-editor__tab formula-editor__tab--active">Math</button>
        <button class="formula-editor__tab formula-editor__tab--soon" disabled>
          Image <span class="formula-editor__soon-badge">Soon</span>
        </button>
      </div>
    </div>

    <div class="formula-editor__hint">
      Variables: <code>x</code> (sample position −1…1), <code>y</code> (frame index −1…1)
    </div>

    <textarea
      v-model="localFormula"
      class="formula-editor__textarea"
      spellcheck="false"
      autocomplete="off"
      placeholder="sin(x * PI)"
      @keydown.ctrl.enter="handlePreview"
      @keydown.meta.enter="handlePreview"
    />

    <div v-if="error" class="formula-editor__error">{{ error }}</div>

    <div class="formula-editor__footer">
      <div class="formula-editor__footer-left">
        <button class="formula-editor__btn formula-editor__btn--soon" disabled>
          Formula Library <span class="formula-editor__soon-badge">Soon</span>
        </button>
      </div>
      <button
        class="formula-editor__btn formula-editor__btn--primary"
        :disabled="isGenerating"
        @click="handlePreview"
      >
        {{ isGenerating ? 'Generating…' : 'Preview' }}
        <span class="formula-editor__shortcut">Ctrl+↵</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  initialFormula: string
  isGenerating: boolean
  error: string | null
}>()

const emit = defineEmits<{
  preview: [formula: string]
}>()

const localFormula = ref(props.initialFormula)

watch(() => props.initialFormula, (v) => {
  localFormula.value = v
})

function handlePreview() {
  emit('preview', localFormula.value)
}
</script>

<style scoped>
.formula-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 3rem;
  box-sizing: border-box;
  gap: 2rem;
}

.formula-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.formula-editor__label {
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  letter-spacing: 0.25rem;
  text-transform: uppercase;
}

.formula-editor__mode-tabs {
  display: flex;
  gap: 1rem;
}

.formula-editor__tab {
  padding: 1rem 3rem;
  font-size: 3rem;
  font-family: 'IBM Plex Sans', sans-serif;
  background: transparent;
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  color: rgba(227, 227, 227, 0.5);
  cursor: pointer;
  border-radius: 1rem;
}

.formula-editor__tab--active {
  border-color: #e3e3e3;
  color: #e3e3e3;
}

.formula-editor__tab--soon {
  cursor: not-allowed;
  opacity: 0.4;
}

.formula-editor__soon-badge {
  font-size: 2.5rem;
  color: rgba(227, 227, 227, 0.5);
  margin-left: 1rem;
}

.formula-editor__hint {
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.3);
  flex-shrink: 0;
}

.formula-editor__hint code {
  font-family: 'IBM Plex Mono', monospace;
  color: rgba(227, 227, 227, 0.5);
}

.formula-editor__textarea {
  flex: 1;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  color: #e3e3e3;
  border: 0.25rem solid rgba(227, 227, 227, 0.12);
  border-radius: 1rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 3.5rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  padding: 3rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.formula-editor__textarea:focus {
  border-color: rgba(227, 227, 227, 0.35);
}

.formula-editor__error {
  font-size: 3rem;
  color: #ff6b6b;
  font-family: 'IBM Plex Mono', monospace;
  flex-shrink: 0;
}

.formula-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.formula-editor__footer-left {
  display: flex;
  gap: 2rem;
}

.formula-editor__btn {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 4rem;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 3.5rem;
  border-radius: 1rem;
  cursor: pointer;
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  background: transparent;
  color: rgba(227, 227, 227, 0.5);
  transition: background 0.15s, border-color 0.15s;
}

.formula-editor__btn--primary {
  border-color: #e3e3e3;
  color: #e3e3e3;
}

.formula-editor__btn--primary:hover:not(:disabled) {
  background: rgba(227, 227, 227, 0.08);
}

.formula-editor__btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.formula-editor__btn--soon {
  cursor: not-allowed;
  opacity: 0.4;
}

.formula-editor__shortcut {
  font-size: 2.5rem;
  color: rgba(227, 227, 227, 0.4);
}
</style>
