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

    <template v-if="!libraryOpen">
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
        <button class="formula-editor__btn" @click="openLibrary">
          Library
        </button>
        <button
          class="formula-editor__btn formula-editor__btn--primary"
          :disabled="isGenerating"
          @click="handlePreview"
        >
          {{ isGenerating ? 'Generating…' : 'Preview' }}
          <span class="formula-editor__shortcut">Ctrl+↵</span>
        </button>
      </div>
    </template>

    <template v-else>
      <div class="formula-library">
        <div class="formula-library__save">
          <input
            v-model="saveName"
            class="formula-library__name-input"
            placeholder="Formula name…"
            @keydown.enter="handleSave"
          />
          <button
            class="formula-editor__btn formula-editor__btn--primary"
            :disabled="!localFormula.trim()"
            @click="handleSave"
          >
            Save current
          </button>
        </div>

        <div class="formula-library__divider" />

        <div class="formula-library__list">
          <div v-if="formulas.length === 0" class="formula-library__empty">
            No saved formulas yet
          </div>

          <div
            v-for="item in formulas"
            :key="item.id"
            class="formula-library__item"
          >
            <div class="formula-library__item-info">
              <span class="formula-library__item-name">{{ item.name }}</span>
              <code class="formula-library__item-preview">{{ firstLine(item.formula) }}</code>
              <span class="formula-library__item-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="formula-library__item-actions">
              <button
                class="formula-editor__btn formula-editor__btn--primary formula-library__item-btn"
                @click="handleLoad(item.formula)"
              >
                Load
              </button>
              <button
                class="formula-library__item-delete"
                @click="remove(item.id)"
                title="Delete"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="formula-editor__footer">
          <button class="formula-editor__btn" @click="libraryOpen = false">
            ← Back to editor
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFormulaLibrary } from '@/entities/formula-library/model/useFormulaLibrary'

const props = defineProps<{
  initialFormula: string
  isGenerating: boolean
  error: string | null
}>()

const emit = defineEmits<{
  preview: [formula: string]
}>()

const { formulas, load, save, remove } = useFormulaLibrary()

const localFormula = ref(props.initialFormula)
const libraryOpen = ref(false)
const saveName = ref('')

watch(() => props.initialFormula, (v) => {
  localFormula.value = v
})

function handlePreview() {
  emit('preview', localFormula.value)
}

async function openLibrary() {
  await load()
  libraryOpen.value = true
}

async function handleSave() {
  if (!localFormula.value.trim()) return
  await save(saveName.value, localFormula.value)
  saveName.value = ''
}

function handleLoad(formula: string) {
  localFormula.value = formula
  libraryOpen.value = false
}

function firstLine(formula: string): string {
  const line = formula.split('\n')[0].trim()
  return line.length > 40 ? line.slice(0, 40) + '…' : line
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  gap: 2rem;
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
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.formula-editor__btn:hover {
  background: rgba(227, 227, 227, 0.05);
  color: rgba(227, 227, 227, 0.8);
}

.formula-editor__btn--primary {
  border-color: #e3e3e3;
  color: #e3e3e3;
}

.formula-editor__btn--primary:hover:not(:disabled) {
  background: rgba(227, 227, 227, 0.08);
}

.formula-editor__btn--primary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.formula-editor__shortcut {
  font-size: 2.5rem;
  color: rgba(227, 227, 227, 0.4);
}

/* Library panel */

.formula-library {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 2rem;
}

.formula-library__save {
  display: flex;
  gap: 2rem;
  flex-shrink: 0;
}

.formula-library__name-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  color: #e3e3e3;
  border: 0.25rem solid rgba(227, 227, 227, 0.12);
  border-radius: 1rem;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 3.5rem;
  padding: 2rem 3rem;
  outline: none;
  transition: border-color 0.15s;
}

.formula-library__name-input:focus {
  border-color: rgba(227, 227, 227, 0.35);
}

.formula-library__name-input::placeholder {
  color: rgba(227, 227, 227, 0.25);
}

.formula-library__divider {
  height: 0.25rem;
  background: rgba(227, 227, 227, 0.08);
  flex-shrink: 0;
}

.formula-library__list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formula-library__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.25);
}

.formula-library__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  padding: 2.5rem 3rem;
  border: 0.25rem solid rgba(227, 227, 227, 0.08);
  border-radius: 1rem;
  transition: border-color 0.15s;
}

.formula-library__item:hover {
  border-color: rgba(227, 227, 227, 0.18);
}

.formula-library__item-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.formula-library__item-name {
  font-size: 3.5rem;
  color: #e3e3e3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.formula-library__item-preview {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.formula-library__item-date {
  font-size: 2.5rem;
  color: rgba(227, 227, 227, 0.25);
}

.formula-library__item-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-shrink: 0;
}

.formula-library__item-btn {
  padding: 1.5rem 3rem;
  font-size: 3rem;
}

.formula-library__item-delete {
  width: 7rem;
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: transparent;
  border: 0.25rem solid transparent;
  border-radius: 1rem;
  color: rgba(227, 227, 227, 0.3);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  line-height: 1;
}

.formula-library__item-delete:hover {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.3);
}
</style>
