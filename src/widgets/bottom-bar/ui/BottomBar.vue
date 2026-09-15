<template>
  <div class="bottom-bar">
    <button
      class="bottom-bar__btn bottom-bar__btn--primary"
      :disabled="!hasFrames"
      @click="handleSave"
    >
      Save to File
    </button>

    <div class="bottom-bar__right">
      <select
        v-if="midiSupported"
        class="bottom-bar__midi-select"
        :class="{ 'bottom-bar__midi-select--connected': midiConnected }"
        :value="selectedMidiDeviceId ?? ''"
        :title="midiTitle"
        @change="onMidiDeviceChange"
      >
        <option value="">All MIDI devices ({{ midiDevices.length }})</option>
        <option v-for="device in midiDevices" :key="device.id" :value="device.id">
          {{ device.name }}
        </option>
      </select>
      <div v-else class="bottom-bar__midi-status" title="Web MIDI is not supported in this browser">
        MIDI unsupported
      </div>

      <button
        class="bottom-bar__btn bottom-bar__btn--icon"
        :class="{ 'bottom-bar__btn--active': keyboardActive }"
        @click="toggleKeyboard()"
        title="Toggle computer keyboard (Ableton-style typing keyboard)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="1" />
          <path d="M7 10v0M11 10v0M15 10v0M17 10v0M7 14h10" />
        </svg>
      </button>

      <div class="bottom-bar__settings-anchor">
        <button
          class="bottom-bar__btn bottom-bar__btn--icon"
          :class="{ 'bottom-bar__btn--active': settingsOpen }"
          @click="settingsOpen = !settingsOpen"
          title="Generation settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
        <SettingsPopup v-if="settingsOpen" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SettingsPopup from '@/features/settings/ui/SettingsPopup.vue'
import { useWavetable } from '@/entities/wavetable/model/useWavetable'
import { useSettings } from '@/features/settings/model/useSettings'
import { downloadWav } from '@/shared/lib/wav-writer'
import { useMidiInput } from '@/features/midi-input/model/useMidiInput'
import { useComputerKeyboard } from '@/features/computer-keyboard/model/useComputerKeyboard'

const { framesBuffer: frames } = useWavetable()
const { frameSize } = useSettings()

const {
  isSupported: midiSupported,
  isConnected: midiConnected,
  devices: midiDevices,
  selectedDeviceId: selectedMidiDeviceId,
  selectDevice: selectMidiDevice,
  error: midiError,
} = useMidiInput()

const { isActive: keyboardActive, toggle: toggleKeyboard } = useComputerKeyboard()

const settingsOpen = ref(false)
const hasFrames = computed(() => frames.value !== null)

const midiTitle = computed(() => midiError.value ?? undefined)

function onMidiDeviceChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  selectMidiDevice(value === '' ? null : value)
}

function handleSave() {
  if (!frames.value) return
  downloadWav(frames.value, frameSize.value)
}
</script>

<style scoped>
.bottom-bar {
  height: 16rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 4rem;
  gap: 3rem;
  border-top: 0.25rem solid rgba(227, 227, 227, 0.08);
  background: #0e0e0e;
}

.bottom-bar__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.bottom-bar__settings-anchor {
  position: relative;
}

.bottom-bar__midi-status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 2.75rem;
  color: rgba(227, 227, 227, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60rem;
}

.bottom-bar__midi-select {
  background: #121212;
  color: rgba(227, 227, 227, 0.5);
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  padding: 1.5rem 3rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 2.75rem;
  cursor: pointer;
  outline: none;
  max-width: 60rem;
  height: 34px;
  transition: color 0.15s, border-color 0.15s;
}

.bottom-bar__midi-select--connected {
  color: #7ee787;
  border-color: rgba(126, 231, 135, 0.35);
}

.bottom-bar__btn {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 4rem;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 3.5rem;
  height: 34px;
  min-width: 34px;
  cursor: pointer;
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  background: transparent;
  color: rgba(227, 227, 227, 0.6);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.bottom-bar__btn--primary {
  border-color: #e3e3e3;
  color: #e3e3e3;
}

.bottom-bar__btn--primary:hover:not(:disabled) {
  background: rgba(227, 227, 227, 0.08);
}

.bottom-bar__btn--primary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.bottom-bar__btn--icon {
  padding: 0;
  justify-content: center;
  color: rgba(227, 227, 227, 0.5);
}

.bottom-bar__btn--icon:hover,
.bottom-bar__btn--active {
  border-color: rgba(227, 227, 227, 0.5);
  color: #e3e3e3;
}
</style>
