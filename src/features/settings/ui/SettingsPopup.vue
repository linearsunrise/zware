<template>
  <div class="settings-popup">
    <div class="settings-popup__title">Generation Settings</div>

    <div class="settings-popup__field">
      <label class="settings-popup__field-label">Samples per frame</label>
      <div class="settings-popup__field-controls">
        <select class="settings-popup__select" :value="selectValue" @change="onSelectChange">
          <option v-for="p in FRAME_SIZE_PRESETS" :key="p" :value="p">{{ p }}</option>
          <option value="custom">Custom</option>
        </select>
        <input
          v-if="frameSizeMode === 'custom'"
          class="settings-popup__input"
          type="number"
          :value="customFrameSizeRaw"
          min="64"
          max="8192"
          step="1"
          @change="onCustomChange"
        />
      </div>
    </div>

    <div class="settings-popup__field">
      <label class="settings-popup__field-label">Frame count</label>
      <input
        class="settings-popup__input settings-popup__input--full"
        type="number"
        :value="frameCount"
        min="1"
        max="1024"
        step="1"
        @change="onFrameCountChange"
      />
    </div>

    <div class="settings-popup__summary">
      {{ frameCount }} frames × {{ frameSize }} samples
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '@/features/settings/model/useSettings'
import type { FrameSizePreset } from '@/shared/config/wavetable'

const {
  frameSizeMode,
  frameSizePreset,
  customFrameSizeRaw,
  frameCount,
  frameSize,
  FRAME_SIZE_PRESETS,
  setFrameSizePreset,
  setCustomFrameSize,
} = useSettings()

const selectValue = computed(() =>
  frameSizeMode.value === 'custom' ? 'custom' : String(frameSizePreset.value),
)

function onSelectChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  if (val === 'custom') {
    setFrameSizePreset('custom')
  } else {
    setFrameSizePreset(Number(val) as FrameSizePreset)
  }
}

function onCustomChange(e: Event) {
  setCustomFrameSize(Number((e.target as HTMLInputElement).value))
}

function onFrameCountChange(e: Event) {
  frameCount.value = Number((e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.settings-popup {
  position: absolute;
  bottom: calc(100% + 2rem);
  right: 0;
  background: #1a1a1a;
  border: 0.25rem solid rgba(227, 227, 227, 0.15);
  ;
  padding: 4rem;
  min-width: 72rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
  z-index: 100;
  box-shadow: 0 -4rem 24rem rgba(0, 0, 0, 0.5);
}

.settings-popup__title {
  font-size: 3.5rem;
  font-weight: 500;
  color: #e3e3e3;
}

.settings-popup__field {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-popup__field-label {
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
}

.settings-popup__field-controls {
  display: flex;
  gap: 2rem;
}

.settings-popup__select {
  background: #121212;
  color: #e3e3e3;
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  padding: 1.5rem 3rem;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 3.5rem;
  ;
  cursor: pointer;
  outline: none;
}

.settings-popup__input {
  background: #121212;
  color: #e3e3e3;
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  padding: 1.5rem 3rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 3.5rem;
  ;
  outline: none;
  width: 24rem;
  box-sizing: border-box;
}

.settings-popup__input--full {
  width: 100%;
}

.settings-popup__summary {
  font-size: 3rem;
  font-family: 'IBM Plex Mono', monospace;
  color: rgba(227, 227, 227, 0.3);
  border-top: 0.25rem solid rgba(227, 227, 227, 0.08);
  padding-top: 3rem;
}
</style>
