<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { state, BONUS_AT, addPoints, addFoul, addTimeout, setTeamName } from '../state/gameState'

const props = defineProps({
  teamKey: { type: String, required: true }
})

const { t } = useI18n()

const team = computed(() => state.teams[props.teamKey])
const bonus = computed(() => team.value.fouls >= BONUS_AT)

function onNameChange(e) {
  setTeamName(props.teamKey, e.target.value)
}
</script>

<template>
  <section class="team">
    <input
      class="team-name"
      :value="team.name"
      maxlength="14"
      @change="onNameChange"
    >
    <div class="score">{{ team.score }}</div>
    <div class="pts">
      <button @click="addPoints(teamKey, 1)">+1</button>
      <button @click="addPoints(teamKey, 2)">+2</button>
      <button @click="addPoints(teamKey, 3)">+3</button>
      <button class="minus" @click="addPoints(teamKey, -1)">&minus;1</button>
    </div>
    <div class="stat-row">
      <span class="stat-label">
        {{ t('team.fouls') }}
        <span class="bonus" :class="{ on: bonus }">{{ t('team.bonus') }}</span>
      </span>
      <button class="small" @click="addFoul(teamKey, -1)">&minus;</button>
      <span class="stat-value">{{ team.fouls }}</span>
      <button class="small" @click="addFoul(teamKey, 1)">+</button>
    </div>
    <div class="stat-row">
      <span class="stat-label">{{ t('team.timeouts') }}</span>
      <button class="small" @click="addTimeout(teamKey, -1)">&minus;</button>
      <span class="stat-value">{{ team.timeouts }}</span>
      <button class="small" @click="addTimeout(teamKey, 1)">+</button>
    </div>
  </section>
</template>
