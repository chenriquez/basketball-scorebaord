import { createI18n } from 'vue-i18n'
import { Preferences } from '@capacitor/preferences'
import { Device } from '@capacitor/device'
import { SUPPORTED_LOCALES } from '../state/languageNames'

import es from '../locales/es.json'
import en from '../locales/en.json'
import de from '../locales/de.json'
import fr from '../locales/fr.json'
import pt from '../locales/pt.json'

const LANG_KEY = 'bball-lang'
const FALLBACK = 'en'

async function detectInitialLocale() {
  try {
    const { value } = await Preferences.get({ key: LANG_KEY })
    if (value && SUPPORTED_LOCALES.includes(value)) return value
  } catch (e) {}

  let deviceCode = FALLBACK
  try {
    const { value } = await Device.getLanguageCode()
    if (value) deviceCode = value.toLowerCase().slice(0, 2)
  } catch (e) {}

  const locale = SUPPORTED_LOCALES.includes(deviceCode) ? deviceCode : FALLBACK
  try { await Preferences.set({ key: LANG_KEY, value: locale }) } catch (e) {}
  return locale
}

export async function setLocalePreference(code) {
  try { await Preferences.set({ key: LANG_KEY, value: code }) } catch (e) {}
}

export async function createI18nInstance() {
  const locale = await detectInitialLocale()
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: FALLBACK,
    messages: { es, en, de, fr, pt }
  })
}
