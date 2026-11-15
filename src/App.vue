<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import athlete from './athlete'
import { english, labels } from './locale'
import PhotoGallery from './PhotoGallery.vue'
import ThemeToggle from './ThemeToggle.vue'

const options = [{ id: 'trail', label: 'Trail' }, { id: 'skimo', label: 'Skimo' }]
const sport = ref('trail')
const language = ref('sl')
const copy = computed(() => labels[language.value])
const current = computed(() => {
  const original = athlete[sport.value]
  if (language.value === 'sl') return original
  const translation = english[sport.value]
  return {
    ...original,
    ...translation,
    gallery: original.gallery.map((photo, index) => ({ ...photo, ...translation.gallery[index] })),
  }
})
const hero = computed(() => current.value.gallery[0])
const image = (file) => import.meta.env.BASE_URL + 'images/' + file

function syncLocation() {
  const params = new URLSearchParams(location.search)
  sport.value = params.get('sport') === 'skimo' ? 'skimo' : 'trail'
  language.value = params.get('lang') === 'en' ? 'en' : 'sl'
  document.documentElement.lang = language.value
  document.title = `${athlete.first} ${athlete.last} · ${current.value.title}`
}

function pageLink(nextSport, nextLanguage) {
  const url = new URL(location.href)
  url.search = ''
  if (nextSport === 'skimo') url.searchParams.set('sport', 'skimo')
  if (nextLanguage === 'en') url.searchParams.set('lang', 'en')
  return url.pathname + url.search
}

function navigate(event, resetScroll) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  const target = event.currentTarget.href
  if (target !== location.href) history.pushState({}, '', target)
  syncLocation()
  if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' })
}

syncLocation()
onMounted(() => window.addEventListener('popstate', syncLocation))
onUnmounted(() => window.removeEventListener('popstate', syncLocation))
</script>

<template>
  <header class="topbar">
    <div class="site-header">
      <a class="brand" :href="pageLink(sport, language)" @click="navigate($event, true)">K<span>Š</span></a>
      <nav :aria-label="copy.nav">
        <div class="nav-links">
          <a v-for="option in options" :key="option.id" :href="pageLink(option.id, language)"
            :aria-current="sport === option.id ? 'page' : undefined" @click="navigate($event, true)">
            {{ option.label }}
          </a>
          <a class="language-link" :href="pageLink(sport, language === 'sl' ? 'en' : 'sl')"
            :lang="language === 'sl' ? 'en' : 'sl'" :aria-label="copy.language" @click="navigate($event, false)">
            {{ language === 'sl' ? 'EN' : 'SI' }}
          </a>
        </div>
        <ThemeToggle :labels="copy" />
      </nav>
    </div>
  </header>
  <main :class="sport">
    <section class="hero">
      <figure class="hero-photo">
        <img :src="image(hero.file)" :alt="hero.alt" :style="{ objectPosition: hero.position }" fetchpriority="high">
        <figcaption>{{ hero.caption }}</figcaption>
      </figure>
      <div class="hero-inner">
        <p class="label">{{ current.title }}</p>
        <h1>{{ athlete.first }}<br><em>{{ athlete.last }}</em></h1>
        <p class="intro">{{ current.intro }}</p>
      </div>
    </section>
    <div class="wrap">
      <section class="results" id="rezultati" aria-labelledby="results-title">
        <div class="section-head">
          <h2 id="results-title">{{ copy.results }}</h2>
          <a :href="current.source">{{ sport === 'trail' ? copy.trailSource : copy.skimoSource }} <span aria-hidden="true">↗</span></a>
        </div>
        <ul>
          <li v-for="[place, race, detail] in current.stats" :key="race + detail">
            <strong>{{ place }}</strong>
            <div><span>{{ race }}</span><small>{{ detail }}</small></div>
          </li>
        </ul>
      </section>
      <PhotoGallery :key="sport + language" :photos="current.gallery" :labels="copy" />
    </div>
  </main>
  <div class="wrap back-to-top">
    <a href="#app">{{ copy.top }} <span aria-hidden="true">↑</span></a>
  </div>
  <footer class="wrap site-footer">
    <div class="footer-contact">
      <h2>{{ copy.contacts }}</h2>
      <ul>
        <li><a :href="athlete.contacts.strava">Strava</a></li>
        <li><a :href="athlete.trail.source">UTMB</a></li>
        <li v-if="athlete.contacts.email"><a :href="'mailto:' + athlete.contacts.email">{{ copy.email }}</a></li>
        <li><a :href="athlete.contacts.instagram">Instagram</a></li>
      </ul>
    </div>
    <div class="footer-meta">
      <p>© 2026 {{ athlete.first }} {{ athlete.last }}. {{ copy.rights }}</p>
      <p>{{ copy.updated }} <time datetime="2026-11-15">{{ copy.date }}</time></p>
    </div>
    <p>{{ copy.author }} <a href="https://nejc-ursic.netlify.app/">Nejc Uršič</a></p>
  </footer>
</template>
