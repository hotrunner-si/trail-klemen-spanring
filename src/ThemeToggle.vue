<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({ labels: { type: Object, required: true } })
const key = 'athlete-theme'
const theme = ref('light')
const dark = computed(() => theme.value === 'dark')
const label = computed(() => dark.value ? props.labels.light : props.labels.dark)

function applyTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
}

function toggle() {
  const next = dark.value ? 'light' : 'dark'
  applyTheme(next)
  try { localStorage.setItem(key, next) } catch {}
}

onMounted(() => {
  let saved
  try { saved = localStorage.getItem(key) } catch {}
  applyTheme(saved === 'light' || saved === 'dark' ? saved :
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
})
</script>

<template>
  <button class="theme-toggle" type="button" :aria-label="label" :title="label" @click="toggle">
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <g v-if="dark">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1m0-15.6-2.1 2.1M6.3 17.7l-2.1 2.1" />
      </g>
      <path v-else d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  </button>
</template>
