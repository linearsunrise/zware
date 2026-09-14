<template>
  <div v-if="isActive" class="computer-keyboard">
    <div class="computer-keyboard__info">
      <span class="computer-keyboard__label">Computer Keyboard</span>
      <span class="computer-keyboard__stat">Base {{ baseNoteName }}</span>
      <span class="computer-keyboard__stat">Velocity {{ velocity }}</span>
      <span class="computer-keyboard__hint">Z/X octave · C/V velocity</span>
    </div>

    <div class="computer-keyboard__keys">
      <div
        v-for="(binding, index) in whiteKeys"
        :key="binding.code"
        class="computer-keyboard__key computer-keyboard__key--white"
        :class="{ 'computer-keyboard__key--active': pressedCodes.has(binding.code) }"
        :style="{ left: `${index * (WHITE_KEY_WIDTH + WHITE_KEY_GAP)}rem` }"
      >
        {{ binding.label }}
      </div>

      <div
        v-for="binding in blackKeys"
        :key="binding.code"
        class="computer-keyboard__key computer-keyboard__key--black"
        :class="{ 'computer-keyboard__key--active': pressedCodes.has(binding.code) }"
        :style="{ left: `${blackKeyLeft(binding.afterIndex)}rem` }"
      >
        {{ binding.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useComputerKeyboard } from '@/features/computer-keyboard/model/useComputerKeyboard'
import {
  BLACK_KEY_BINDINGS,
  WHITE_KEY_BINDINGS,
  midiNoteName,
} from '@/features/computer-keyboard/model/keymap'

const WHITE_KEY_WIDTH = 12
const WHITE_KEY_GAP = 0.5
const BLACK_KEY_WIDTH = 7

const { isActive, baseNote, velocity, pressedCodes } = useComputerKeyboard()

const whiteKeys = WHITE_KEY_BINDINGS
const blackKeys = BLACK_KEY_BINDINGS

const baseNoteName = computed(() => midiNoteName(baseNote.value))

function blackKeyLeft(afterIndex: number): number {
  return (afterIndex + 1) * (WHITE_KEY_WIDTH + WHITE_KEY_GAP) - BLACK_KEY_WIDTH / 2
}
</script>

<style scoped>
.computer-keyboard {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 4rem;
  background: #0e0e0e;
  border-top: 0.25rem solid rgba(227, 227, 227, 0.08);
}

.computer-keyboard__info {
  display: flex;
  align-items: center;
  gap: 4rem;
  flex-shrink: 0;
}

.computer-keyboard__label {
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.4);
  letter-spacing: 0.25rem;
  text-transform: uppercase;
}

.computer-keyboard__stat {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 3rem;
  color: rgba(227, 227, 227, 0.7);
}

.computer-keyboard__hint {
  margin-left: auto;
  font-size: 2.5rem;
  color: rgba(227, 227, 227, 0.3);
}

.computer-keyboard__keys {
  position: relative;
  height: 40rem;
  flex-shrink: 0;
  overflow-x: auto;
}

.computer-keyboard__key {
  position: absolute;
  top: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2rem;
  box-sizing: border-box;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 2.75rem;
  user-select: none;
  transition: background 0.05s, color 0.05s;
}

.computer-keyboard__key--white {
  width: 12rem;
  height: 40rem;
  background: #1a1a1a;
  border: 0.25rem solid rgba(227, 227, 227, 0.15);
  color: rgba(227, 227, 227, 0.5);
  z-index: 1;
}

.computer-keyboard__key--black {
  width: 7rem;
  height: 24rem;
  background: #050505;
  border: 0.25rem solid rgba(227, 227, 227, 0.2);
  color: rgba(227, 227, 227, 0.4);
  z-index: 2;
}

.computer-keyboard__key--active.computer-keyboard__key--white {
  background: #e3e3e3;
  color: #121212;
}

.computer-keyboard__key--active.computer-keyboard__key--black {
  background: #8a8a8a;
  color: #121212;
}
</style>
