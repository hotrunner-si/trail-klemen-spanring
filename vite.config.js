import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { variantEntries } from './site-variants/vite.mjs'

const entry = (path) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig(variantEntries(entry, vue))
