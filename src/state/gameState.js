import { reactive, computed, watch } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { KeepAwake } from '@capacitor-community/keep-awake'
import { lightTap, mediumTap, buzzerVibration } from '../utils/haptics'

const QK = 'bball-proto-v1'
const DEFAULT_MIN = 10
const OT_MIN = 5
export const BONUS_AT = 5
const SAVE_THROTTLE_MS = 1000

function defState() {
  return {
    qMin: DEFAULT_MIN,
    period: 1,
    clockMs: DEFAULT_MIN * 60000,
    running: false,
    teams: {
      A: { name: 'LOCAL', score: 0, fouls: 0, timeouts: 0 },
      B: { name: 'VISITA', score: 0, fouls: 0, timeouts: 0 }
    }
  }
}

export const state = reactive(defState())

export const ui = reactive({
  showConfig: false,
  showReset: false,
  cfgTemp: DEFAULT_MIN
})

const history = reactive([])
export const canUndo = computed(() => history.length > 0)

let lastTick = null
let lastSavedAt = 0
let tickInterval = null

async function loadPersisted() {
  try {
    const { value } = await Preferences.get({ key: QK })
    if (value) {
      Object.assign(state, JSON.parse(value))
    }
  } catch (e) {}
  state.running = false // nunca retomar corriendo tras recargar
}

function persistNow() {
  lastSavedAt = Date.now()
  try { Preferences.set({ key: QK, value: JSON.stringify(state) }) } catch (e) {}
}

function save(force = false) {
  const now = Date.now()
  if (!force && now - lastSavedAt < SAVE_THROTTLE_MS) return
  persistNow()
}

function snapshot() {
  history.push(JSON.stringify(state))
  if (history.length > 60) history.shift()
}

export function undo() {
  if (!history.length) return
  const wasRunning = state.running
  Object.assign(state, JSON.parse(history.pop()))
  state.running = wasRunning // deshacer no toca el reloj en marcha
  persistNow()
}

export function periodMinutes() {
  return state.period <= 4 ? state.qMin : OT_MIN
}

function tick() {
  if (!state.running) { lastTick = null; return }
  const now = Date.now()
  if (lastTick != null) {
    state.clockMs -= (now - lastTick)
    if (state.clockMs <= 0) {
      state.clockMs = 0
      state.running = false
      buzzer()
    }
  }
  lastTick = now
  save()
}

export function startTicking() {
  if (tickInterval) return
  tickInterval = setInterval(tick, 120)
}

// ---------- Reloj ----------
export function toggleClock() {
  if (state.clockMs <= 0 && !state.running) return
  state.running = !state.running
  lastTick = null
  save(true)
}

export function resetClock() {
  snapshot()
  state.running = false
  state.clockMs = periodMinutes() * 60000
  save(true)
}

export function nextPeriod() {
  snapshot()
  state.running = false
  state.period += 1
  state.teams.A.fouls = 0
  state.teams.B.fouls = 0 // faltas de equipo por periodo
  state.clockMs = periodMinutes() * 60000
  mediumTap()
  save(true)
}

export function adjustClock(delta) {
  snapshot()
  const max = periodMinutes() * 60000
  state.clockMs = Math.min(max, Math.max(0, state.clockMs + delta))
  save(true)
}

// ---------- Acciones de equipo ----------
export function addPoints(k, n) {
  snapshot()
  state.teams[k].score = Math.max(0, state.teams[k].score + n)
  lightTap()
  save(true)
}

export function addFoul(k, n) {
  snapshot()
  state.teams[k].fouls = Math.max(0, state.teams[k].fouls + n)
  if (n > 0) lightTap()
  save(true)
}

export function addTimeout(k, n) {
  snapshot()
  state.teams[k].timeouts = Math.max(0, state.teams[k].timeouts + n)
  save(true)
}

export function setTeamName(k, name) {
  snapshot()
  state.teams[k].name = name.trim() || (k === 'A' ? 'LOCAL' : 'VISITA')
  save(true)
}

// ---------- Modal de configuración ----------
export function openConfig() {
  ui.cfgTemp = state.qMin
  ui.showConfig = true
}

export function setCfgTemp(n) {
  ui.cfgTemp = Math.min(30, Math.max(1, n))
}

export function saveConfig() {
  snapshot()
  state.qMin = ui.cfgTemp
  if (!state.running && state.period <= 4) state.clockMs = ui.cfgTemp * 60000
  closeModals()
  save(true)
}

// ---------- Modal de nuevo partido ----------
export function openResetConfirm() {
  ui.showReset = true
}

export function confirmReset() {
  snapshot()
  const q = state.qMin
  Object.assign(state, defState())
  state.qMin = q
  state.clockMs = q * 60000
  closeModals()
  save(true)
}

export function closeModals() {
  ui.showConfig = false
  ui.showReset = false
}

// ---------- Sonido y vibración ----------
function buzzer() {
  buzzerVibration()
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = 220
    g.gain.setValueAtTime(0.4, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 1.1)
  } catch (e) {}
}

// ---------- Pantalla encendida ----------
async function requestWake() {
  try { await KeepAwake.keepAwake() } catch (e) {}
}
async function releaseWake() {
  try { await KeepAwake.allowSleep() } catch (e) {}
}

// El reloj puede detenerse desde varios lugares (fin de período, reset,
// nuevo partido, deshacer, no solo toggleClock), así que el wake lock
// sigue a state.running en un solo lugar en vez de repetirse en cada uno.
watch(() => state.running, (running) => {
  if (running) requestWake(); else releaseWake()
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.running) requestWake()
})

export async function initGameState() {
  await loadPersisted()
  startTicking()
}
