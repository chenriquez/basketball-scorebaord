<script setup>
import { useI18n } from 'vue-i18n'
import GameClock from './components/GameClock.vue'
import Scoreboard from './components/Scoreboard.vue'
import ConfigModal from './components/ConfigModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { ui, canUndo, undo, resetClock, openResetConfirm, closeModals, confirmReset } from './state/gameState'

const { t } = useI18n()
</script>

<template>
  <GameClock />
  <Scoreboard />

  <div class="footer">
    <button class="undo" :disabled="!canUndo" @click="undo">&#8617; {{ t('footer.undo') }}</button>
    <button @click="resetClock">&#8634; {{ t('clock.resetClock') }}</button>
    <button style="color:var(--danger)" @click="openResetConfirm">{{ t('footer.newGame') }}</button>
  </div>

  <div class="overlay" v-if="ui.showConfig || ui.showReset">
    <ConfigModal v-if="ui.showConfig" />
    <ConfirmModal
      v-if="ui.showReset"
      :title="t('reset.title')"
      :body="t('reset.body')"
      :cancel-text="t('reset.cancel')"
      :confirm-text="t('reset.confirm')"
      danger
      @cancel="closeModals"
      @confirm="confirmReset"
    />
  </div>
</template>
