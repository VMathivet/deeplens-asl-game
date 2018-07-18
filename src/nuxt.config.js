const bodyParser = require('body-parser')

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'AWS DeepLens Game made by TeamWork & Corexpert',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'AWS DeepLens Game made by TeamWork & Corexpert'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  loading: false,
  /*
  ** Build configuration
  */
  css: [
    { src: 'vue-material/dist/vue-material.min.css', lang: 'css' },
    { src: '~/assets/theme.scss', lang: 'scss' },
    { src: '~/assets/fstyle.css', lang: 'css' }
  ],
  /*
  ** NuxtJS Plugins
  */
  plugins: [
    { src: '~/plugins/vue-material' },
    { src: '~/plugins/vue-focus-keyboard', ssr: false }
  ],
  /*
  ** NuxtJS Modules
  */
  modules: [
    '@nuxtjs/toast'
  ],
  /*
  ** NuxtJS ServerMiddlewares
  */
  serverMiddleware: [
    // body-parser middleware
    bodyParser.json(),
    // Api middleware
    '~/api'
  ],
  /*
  ** Build section
  */
  build: {
    watch: ['~/static/asl_scores/scores.json'],
    vendor: ['vue-material', 'vue-focus-keyboard', 'axios'],
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      config.module.rules.push({
        test: /\.svg$/,
        loader: 'svg-inline-loader',
        exclude: /(node_modules)/
      })
    }
  }
}
