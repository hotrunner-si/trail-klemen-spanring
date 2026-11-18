import { onMounted, onUnmounted, ref } from 'vue'

export function useMinimalMobile() {
  const media = window.matchMedia('(max-width: 46rem)')
  const mobile = ref(media.matches)
  const update = () => { mobile.value = media.matches }
  onMounted(() => media.addEventListener('change', update))
  onUnmounted(() => media.removeEventListener('change', update))
  return mobile
}
