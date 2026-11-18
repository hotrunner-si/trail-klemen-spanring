const versions = [1, 2]

export function variantEntries(entry, vue) {
  const barePaths = new Set(versions.map((version) => `/v${version}`))
  const redirectVariants = (server) => {
    server.middlewares.use((request, response, next) => {
      const [path, query] = (request.url ?? '').split(/\?(.*)/s)
      if (/^\/v\d+(?:\/|$)/.test(path) && !/^\/v[12](?:\/|$)/.test(path)) {
        response.writeHead(404)
        response.end('Stran ne obstaja.')
        return
      }
      if (!barePaths.has(path)) return next()
      response.writeHead(308, { Location: path + '/' + (query ? '?' + query : '') })
      response.end()
    })
  }

  return {
    base: './',
    plugins: [
      vue(),
      {
        name: 'athlete-variant-urls',
        configureServer: redirectVariants,
        configurePreviewServer: redirectVariants,
      },
    ],
    resolve: { dedupe: ['vue'] },

    build: {
      rollupOptions: {
        input: [
          entry('./index.html'),
          ...versions.map((version) => entry(`./v${version}/index.html`)),
        ],
      },
    },
  }
}
