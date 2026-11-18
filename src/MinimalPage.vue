<script setup>
import { computed, ref } from 'vue'
import athlete from './athlete.js'
import { utmbResults } from './utmb-results.js'

const props = defineProps({ version: String, imageBase: String })
const isSplit = false
const isCompact = props.version === 'v3'
const menu = computed(() => {
  const items = isCompact
  ? [['trail', 'Trail tek'], ['skimo', 'Skimo'], ['contact', 'Kontakti']]
  : [['about', 'O meni'], ['results', 'Rezultati'], ['gallery', 'Galerija'], ['contact', 'Kontakt']]
  return isCompact ? [['about', 'O meni'], ...items] : items
})

const active = ref('about')
const sports = [
  {
    id: 'trail',
    label: 'Trail tek',
    sourceLabel: 'Profil UTMB',
    ...athlete.trail,
    stats: utmbResults,
  },
  { id: 'skimo', label: 'Skimo', sourceLabel: 'Rezultati PZS', ...athlete.skimo },
]
const photos = sports.flatMap(sport => sport.gallery.filter(photo => photo.file))
const cover = photos[0]
const contacts = [
  { label: 'Instagram', url: athlete.contacts.instagram },
  { label: 'Strava', url: athlete.contacts.strava },
  { label: 'UTMB', url: athlete.trail.source },
  { label: 'E-pošta', url: 'mailto:' + athlete.contacts.email },
]
</script>

<template>
  <main class="minimal" :class="version">
    <header class="identity">
      <img class="cover" :src="imageBase + cover.file" :alt="cover.alt" fetchpriority="high">
      <h1>
        <button v-if="isCompact" class="profile-name" type="button"
          :aria-pressed="active === 'about'" @click="active = 'about'">
          {{ athlete.first }} {{ athlete.last }}
        </button>
        <template v-else>{{ athlete.first }} {{ athlete.last }}</template>
      </h1>
    </header>

    <div class="content">
      <nav v-if="!isSplit" aria-label="Vsebina">
        <button v-for="[id, label] in menu" :key="id" :data-label="label" type="button"
          :aria-pressed="active === id" @click="active = active === id && isCompact ? 'about' : id">
          <span class="nav-label">{{ label }}</span>
        </button>
      </nav>

      <p v-if="isCompact && active === 'about'" class="panel profile-bio">{{ athlete.bio }}</p>

      <section v-if="active === 'about' && !isSplit && !isCompact" class="panel about" aria-labelledby="about-title">
        <div>
          <h2 id="about-title">O meni</h2>
          <p>{{ athlete.trail.intro }}</p>
          <p>{{ athlete.skimo.intro }}</p>
        </div>
        <img :src="imageBase + cover.file" :alt="cover.alt" fetchpriority="high">
      </section>

      <section v-if="isSplit || active === 'contact'" class="panel" aria-labelledby="contact-title">
        <h2 id="contact-title">{{ isCompact ? 'Kontakti' : 'Kontakt' }}</h2>
        <ul class="links">
          <li v-for="link in contacts" :key="link.label"><a :href="link.url">{{ link.label }}</a></li>
        </ul>
      </section>

      <section v-if="isSplit || active === 'results' || active === 'trail' || active === 'skimo'"
        class="panel" :aria-label="isCompact ? menu.find(([id]) => id === active)?.[1] : 'Rezultati'">
        <h2 v-if="!isCompact">Rezultati</h2>
        <template v-for="sport in sports" :key="sport.id">
          <div v-if="!isCompact || active === sport.id" class="discipline">
            <component :is="isCompact ? 'h2' : 'h3'">{{ sport.label }}</component>
            <ul class="results">
              <li v-for="[place, race, detail] in sport.stats" :key="race + detail">
                <strong>{{ place }}</strong>
                <span>
                  {{ race.slice(0, -4) }}<time class="result-year" :datetime="race.slice(-4)">{{ race.slice(-4) }}</time>
                  <small>{{ detail }}</small>
                </span>
              </li>
            </ul>
            <a :href="sport.source">{{ sport.sourceLabel }}</a>
          </div>
        </template>
      </section>

      <section v-if="isSplit || active === 'gallery'" class="panel" aria-labelledby="gallery-title">
        <h2 id="gallery-title">Galerija</h2>
        <div class="photos">
          <figure v-for="photo in photos" :key="photo.file">
            <img :src="imageBase + photo.file" :alt="photo.alt" loading="lazy">
            <figcaption>{{ photo.caption }}</figcaption>
          </figure>
        </div>
      </section>
    </div>
  </main>
</template>
