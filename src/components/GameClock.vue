<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  state,
  toggleClock,
  nextPeriod,
  adjustClock,
  openConfig
} from '../state/gameState'
import { fmt } from '../utils/format'

const { t } = useI18n()

const timeText = computed(() => fmt(state.clockMs))
const isLow = computed(() => state.clockMs <= 60000 && state.clockMs > 0)
const periodText = computed(() =>
  state.period <= 4 ? state.period : t('clock.otPrefix', { n: state.period - 4 })
)
const hintText = computed(() => {
  if (state.clockMs === 0) return t('clock.endOfPeriod')
  return state.running ? t('clock.running') : t('clock.tapToStart')
})

function onAdjustRowClick(e) {
  const btn = e.target.closest('button[data-adj]')
  if (!btn) return
  adjustClock(parseInt(btn.dataset.adj, 10))
}
</script>

<template>
  <div class="topbar">
    <div class="period">
      <div class="label">{{ t('clock.period') }}</div>
      <div class="value">{{ periodText }}</div>
      <button class="ghost-dark small" style="margin-top:6px" @click="nextPeriod">
        {{ t('clock.next') }} &#9656;
      </button>
    </div>

    <div class="clock" @click="toggleClock">
      <div class="time" :class="{ low: isLow }">{{ timeText }}</div>
      <div class="hint">{{ hintText }}</div>
      <div class="adjust" @click.stop="onAdjustRowClick">
        <button class="ghost-dark small" data-adj="-60000">&minus;1m</button>
        <button class="ghost-dark small" data-adj="-10000">&minus;10s</button>
        <button class="ghost-dark small" data-adj="-1000">&minus;1s</button>
        <button class="ghost-dark small" data-adj="1000">+1s</button>
        <button class="ghost-dark small" data-adj="10000">+10s</button>
        <button class="ghost-dark small" data-adj="60000">+1m</button>
      </div>
    </div>

    <div class="clockbtns">
      <button class="primary" @click="toggleClock">{{ state.running ? '❚❚' : '▶' }}</button>
      <button class="ghost-dark small" @click="openConfig">&#9881; {{ state.qMin }}'</button>
    </div>
  </div>
</template>
