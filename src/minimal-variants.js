import { createApp } from 'vue'
import MinimalPage from './MinimalPage.vue'
import './minimal-variants.css'

const target = document.getElementById('app')
const imageBase = import.meta.env.DEV
  ? import.meta.env.BASE_URL + 'images/'
  : new URL(/* @vite-ignore */ '../images/', import.meta.url).href

createApp(MinimalPage, { version: target.dataset.version, imageBase }).mount(target)
