<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  athlete: { type: Object, required: true },
  english: { type: Object, required: true },
  labels: { type: Object, required: true },
  design: { type: String, required: true },
  themeToggle: { type: Object, required: true },
  imageBase: { type: String, required: true },
})

const translations = {
  sl: { disciplines: 'Disciplini', about: 'O meni', resultsNav: 'Rezultati' },
  en: { disciplines: 'Disciplines', about: 'About', resultsNav: 'Results' },
}
const layouts = {
  'klemen-v2': ['results', 'gallery'],
  'klemen-v3': ['gallery', 'results'],
  'klemen-v4': ['about', 'results', 'gallery'],
  'klemen-v5': ['results', 'gallery'],
}
const sections = layouts[props.design]
const sports = [{ id: 'trail', label: 'Trail' }, { id: 'skimo', label: 'Skimo' }]
const multiSport = Boolean(props.athlete.skimo)
const sport = ref('trail')
const language = ref('sl')
const dialog = ref(null)
const selectedPhoto = ref(null)
const photoTrigger = ref(null)
const copy = computed(() => ({ ...props.labels[language.value], ...translations[language.value] }))
const fullName = props.athlete.first + ' ' + props.athlete.last
const current = computed(() => {
  const data = props.athlete[sport.value]
  const translation = language.value === 'en' ? props.english[sport.value] : null
  return {
    ...data,
    ...translation,
    gallery: data.gallery
      .map((photo, index) => ({ ...photo, ...translation?.gallery[index] }))
      .filter((photo) => photo.file),
  }
})
const heroPhoto = { 'anze-v3': 'anze-ledenik.webp', 'anze-v5': 'anze-gorska-panorama.webp' }[props.design]
const hero = computed(() => current.value.gallery.find(({ file }) => file === heroPhoto) ?? current.value.gallery[0])
const contacts = [
  { name: 'Instagram', url: props.athlete.contacts?.instagram },
  { name: 'Strava', url: props.athlete.contacts?.strava },
  { name: 'UTMB', url: props.athlete.trail.source },
].filter(({ url }) => url)

function syncLocation() {
  const params = new URLSearchParams(location.search)
  sport.value = multiSport && params.get('sport') === 'skimo' ? 'skimo' : 'trail'
  language.value = params.get('lang') === 'en' ? 'en' : 'sl'
  document.documentElement.lang = language.value
  document.title = fullName + ' · ' + current.value.title
}

function pageLink(nextSport, nextLanguage) {
  const url = new URL(location.href)
  url.search = ''
  if (nextSport === 'skimo') url.searchParams.set('sport', 'skimo')
  if (nextLanguage === 'en') url.searchParams.set('lang', 'en')
  url.hash = ''
  return url.pathname + url.search + url.hash
}

function navigate(event, resetScroll) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  if (location.href !== event.currentTarget.href) {
    history.pushState({}, '', event.currentTarget.href)
    syncLocation()
  }
  if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' })
}

async function openPhoto(photo, event) {
  photoTrigger.value = event.currentTarget
  selectedPhoto.value = photo
  await nextTick()
  dialog.value.showModal()
}

function restoreFocus() {
  photoTrigger.value?.focus()
  selectedPhoto.value = null
}

syncLocation()
onMounted(async () => {
  window.addEventListener('popstate', syncLocation)
  await nextTick()
  const target = document.getElementById(location.hash.slice(1))
  target?.scrollIntoView()
})
onUnmounted(() => window.removeEventListener('popstate', syncLocation))
</script>

<template>
  <div class="variant" :class="[design, { 'single-sport': !multiSport }]">
    <header class="variant-header">
      <div class="shell header-inner">
        <a class="wordmark" :href="pageLink(sport, language)" @click="navigate($event, true)">{{ fullName }}</a>
        <nav v-if="multiSport" :aria-label="copy.nav">
          <a v-for="option in sports" :key="option.id" :href="pageLink(option.id, language)"
            :aria-current="sport === option.id ? 'page' : undefined" @click="navigate($event, true)">
            {{ option.label }}
          </a>
          <a class="lang" :href="pageLink(sport, language === 'sl' ? 'en' : 'sl')"
            :aria-label="copy.language" :lang="language === 'sl' ? 'en' : 'sl'" @click="navigate($event, false)">
            {{ language === 'sl' ? 'EN' : 'SI' }}
          </a>
          <component :is="themeToggle" :labels="copy" />
        </nav>
        <nav v-else class="section-nav" :aria-label="copy.nav">
          <a href="#predstavitev">{{ copy.about }}</a>
          <a href="#rezultati">{{ copy.resultsNav }}</a>
          <a href="#galerija">{{ copy.gallery }}</a>
          <a href="#kontakti">{{ copy.contacts }}</a>
        </nav>
        <div v-if="!multiSport" class="header-controls">
          <a class="lang" :href="pageLink(sport, language === 'sl' ? 'en' : 'sl')"
            :aria-label="copy.language" :lang="language === 'sl' ? 'en' : 'sl'" @click="navigate($event, false)">
            {{ language === 'sl' ? 'EN' : 'SI' }}
          </a>
          <component :is="themeToggle" :labels="copy" />
        </div>
      </div>
    </header>

    <main id="vrh" class="shell">
      <section id="predstavitev" class="variant-hero" aria-labelledby="profile-title">
        <figure class="cover">
          <img :src="imageBase + hero.file" :alt="hero.alt" :style="{ objectPosition: hero.position }" fetchpriority="high">
          <figcaption>{{ hero.caption }}</figcaption>
        </figure>
        <div class="hero-copy">
          <p class="eyebrow">{{ current.title }}</p>
          <h1 id="profile-title"><span>{{ athlete.first }}</span> <span>{{ athlete.last }}</span></h1>
          <p class="intro">{{ current.intro }}</p>
          <div class="hero-links">
            <a href="#rezultati">{{ copy.results }} <span aria-hidden="true">↓</span></a>
            <a href="#galerija">{{ copy.gallery }} <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <div class="variant-content">
        <template v-for="section in sections" :key="section">
          <section v-if="section === 'results'" id="rezultati" class="result-section" aria-labelledby="results-heading">
            <div class="section-heading">
              <h2 id="results-heading">{{ copy.results }}</h2>
              <a :href="current.source">{{ sport === 'trail' ? copy.trailSource : copy.skimoSource }} <span aria-hidden="true">↗</span></a>
            </div>
            <ul class="result-list">
              <li v-for="[place, race, detail] in current.stats" :key="race + detail">
                <strong>{{ place }}</strong>
                <div><b>{{ race }}</b><span>{{ detail }}</span></div>
              </li>
            </ul>
          </section>

          <section v-else-if="section === 'gallery'" id="galerija" class="gallery-section" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading">{{ copy.gallery }}</h2>
            <div class="gallery-grid">
              <figure v-for="photo in current.gallery" :key="photo.file">
                <button type="button" class="photo-button" :aria-label="copy.expand + ' — ' + photo.caption" @click="openPhoto(photo, $event)">
                  <img :src="imageBase + photo.file" :alt="photo.alt" :style="{ objectPosition: photo.position }" loading="lazy">
                  <span aria-hidden="true">↗</span>
                </button>
                <figcaption>{{ photo.caption }}</figcaption>
              </figure>
            </div>
          </section>

          <section v-else class="about-section" aria-labelledby="about-heading">
            <h2 id="about-heading">{{ copy.disciplines }}</h2>
            <div class="discipline-grid">
              <article v-for="option in sports" :key="option.id">
                <h3><a :href="pageLink(option.id, language)" @click="navigate($event, true)">{{ (language === 'en' ? english : athlete)[option.id].title }} <span aria-hidden="true">↗</span></a></h3>
                <p>{{ (language === 'en' ? english : athlete)[option.id].intro }}</p>
              </article>
            </div>
          </section>
        </template>
      </div>
    </main>

    <footer id="kontakti" class="shell variant-footer">
      <div class="contact-block">
        <h2>{{ copy.contacts }}</h2>
        <ul>
          <li v-if="athlete.contacts?.email"><a :href="'mailto:' + athlete.contacts.email">{{ copy.email }} ↗</a></li>
          <li v-for="contact in contacts" :key="contact.name"><a :href="contact.url">{{ contact.name }} ↗</a></li>
        </ul>
      </div>
      <div class="footer-meta">
        <p>© 2026 {{ fullName }}. {{ copy.rights }}</p>
        <p>{{ copy.author }} <a href="https://nejc-ursic.netlify.app/">Nejc Uršič</a></p>
        <a href="#vrh">{{ copy.top }} ↑</a>
      </div>
    </footer>

    <dialog ref="dialog" :aria-label="copy.dialog" @click.self="dialog.close()" @close="restoreFocus">
      <form method="dialog"><button type="submit">{{ copy.close }} ×</button></form>
      <figure v-if="selectedPhoto">
        <img :src="imageBase + selectedPhoto.file" :alt="selectedPhoto.alt">
        <figcaption>{{ selectedPhoto.caption }}</figcaption>
      </figure>
    </dialog>
  </div>
</template>

