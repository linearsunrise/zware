<template>
  <div class="app">
    <main class="workspace">
      <section class="workspace__cell">
        <WavetableHeatmap
          :frames="framesBuffer"
          :frame-size="frameSize"
          :frame-count="frameCount"
          :selected-frame-index="selectedFrameIndex"
        />
      </section>

      <section class="workspace__cell">
        <Oscilloscope :frame="currentFrame" :frame-index="selectedFrameIndex" />
      </section>

      <section class="workspace__cell">
        <FormulaEditor
          :initial-formula="formula"
          :is-generating="isGenerating"
          :error="error"
          @preview="handlePreview"
        />
      </section>

      <section class="workspace__cell">
        <FrameSelector
          :frames="framesBuffer"
          :frame-size="frameSize"
          :frame-count="frameCount"
          :selected-index="selectedFrameIndex"
          @select="selectFrame"
        />
      </section>
    </main>

    <BottomBar />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import WavetableHeatmap from '@/widgets/heatmap/ui/WavetableHeatmap.vue';
import Oscilloscope from '@/widgets/oscilloscope/ui/Oscilloscope.vue';
import FormulaEditor from '@/widgets/formula-editor/ui/FormulaEditor.vue';
import FrameSelector from '@/widgets/frame-selector/ui/FrameSelector.vue';
import BottomBar from '@/widgets/bottom-bar/ui/BottomBar.vue';
import { useWavetable } from '@/entities/wavetable/model/useWavetable';

const {
  framesBuffer,
  selectedFrameIndex,
  formula,
  isGenerating,
  error,
  frameSize,
  frameCount,
  preview,
  selectFrame,
} = useWavetable();

const handlePreview = async (formulaText: string) => {
  await preview(formulaText)
}

const currentFrame = computed(() =>
  framesBuffer.value
    ? (framesBuffer.value.subarray(selectedFrameIndex.value * frameSize.value, (selectedFrameIndex.value + 1) * frameSize.value) ?? null)
    : null
);
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  flex: 1;
  min-height: 0;
  background: rgba(227, 227, 227, 0.06);
  gap: 0.25rem;
}

.workspace__cell {
  background: #121212;
  overflow: hidden;
  position: relative;
}
</style>
