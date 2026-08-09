import { defineConfig } from 'vitepress'
import imageFigures from 'markdown-it-image-figures'
import { defineLangConfig, withLangSearch } from 'vitepress-lang'
import { back2topPlugin } from 'vitepress-plugin-back2top'

export default defineConfig(
  withLangSearch({
    base: '/cpc-archive/',
    title: "cpc-archive",
    description: "整理自中共十一大以来历届党的相关会议资料",
    markdown: {
      config: (md) => {
        md.use(imageFigures, {
          figcaption: 'alt',
          lazy: true,
          dataType: true
        })
      }
    },
    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },
    locales: {
      root: defineLangConfig('zh', {
        path: '/',
        link: '/',
        label: '简体中文',
        lang: 'zh-CN',
        themeConfig: {
          nav: [
            { text: '首页', link: '/' },
            { text: '对比', link: '/differences' }
          ],
          sidebar: [
            {
              text: '中共十一大',
              link: '/11'
            },
            {
              text: '中共十二大',
              link: '/12'
            },
            {
              text: '中共十三大',
              link: '/13'
            }
          ],
          socialLinks: [
            { icon: 'github', link: 'https://github.com/maximnightingale/cpc-archive' }
          ],
          editLink: false,
          footer: false,
          notFound: {
            link: '/'
          }
        }
      })
    },
    vite: {
      plugins: [
        back2topPlugin()
      ]
    }
  })
)