import { createApp } from 'vue'
import VariantPage from '../site-variants/VariantPage.vue'
import athlete from './athlete'
import { english, labels } from './locale'
import ThemeToggle from './ThemeToggle.vue'
import '../site-variants/variants.css'

const target = document.getElementById('app')
const imageBase = import.meta.env.DEV
  ? import.meta.env.BASE_URL + 'images/'
  : new URL(/* @vite-ignore */ '../images/', import.meta.url).href

createApp(VariantPage, {
  athlete,
  english,
  labels,
  themeToggle: ThemeToggle,
  design: target.dataset.design,
  imageBase,
}).mount(target)
