<script setup>
import { useI18n } from 'vue-i18n'
import { ui, setCfgTemp, saveConfig, closeModals } from '../state/gameState'
import { SUPPORTED_LOCALES, languageNames } from '../state/languageNames'
import { setLocalePreference } from '../i18n'

const { t, locale } = useI18n()

function selectLanguage(code) {
  locale.value = code
  document.documentElement.lang = code
  setLocalePreference(code)
}
</script>

<template>
  <div class="modal">
    <h3>{{ t('config.title') }}</h3>
    <div class="stepper">
      <button @click="setCfgTemp(ui.cfgTemp - 1)">&minus;</button>
      <div class="stepval"><span>{{ ui.cfgTemp }}</span> {{ t('config.minutes') }}</div>
      <button @click="setCfgTemp(ui.cfgTemp + 1)">+</button>
    </div>
    <div class="presets">
      <button @click="setCfgTemp(8)">8'</button>
      <button @click="setCfgTemp(10)">{{ t('config.presetFiba') }}</button>
      <button @click="setCfgTemp(12)">{{ t('config.presetNba') }}</button>
    </div>
    <p class="note">{{ t('config.overtimeNote') }}</p>

    <div class="stat-row">
      <span class="stat-label">{{ t('config.language') }}</span>
    </div>
    <div class="languages">
      <button
        v-for="code in SUPPORTED_LOCALES"
        :key="code"
        :class="{ active: locale === code }"
        @click="selectLanguage(code)"
      >
        {{ languageNames[code] }}
      </button>
    </div>

    <div class="modal-actions">
      <button @click="closeModals">{{ t('config.cancel') }}</button>
      <button class="primary" @click="saveConfig">{{ t('config.save') }}</button>
    </div>
  </div>
</template>
