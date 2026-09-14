import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function lightTap() {
  try { await Haptics.impact({ style: ImpactStyle.Light }) } catch (e) {}
}

export async function mediumTap() {
  try { await Haptics.impact({ style: ImpactStyle.Medium }) } catch (e) {}
}

export async function buzzerVibration() {
  try {
    await Haptics.vibrate({ duration: 300 })
    setTimeout(() => { Haptics.vibrate({ duration: 300 }).catch(() => {}) }, 400)
  } catch (e) {}
}
