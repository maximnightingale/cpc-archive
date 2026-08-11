import { defineConfig } from 'vitepress'
import imageFigures from 'markdown-it-image-figures'
import { defineLangConfig, withLangSearch } from 'vitepress-lang'
import { back2topPlugin } from 'vitepress-plugin-back2top'

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const basePath = isGitHubActions ? '/cpc-archive/' : '/'

const fontPreloads = [
  ['link', { rel: 'preload', href: '/fonts/方正新舒体.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: '/fonts/TrajanPro3-Semibold.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: '/fonts/华光毛体行楷.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: '/fonts/方正小标宋简体.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: '/fonts/马善政毛笔楷书.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }]
]

export default defineConfig(
  withLangSearch({
    base: basePath,
    title: "cpc-archive",
    description: "整理自中共十一大以来历届党的相关会议资料",
    head: fontPreloads,
    sitemap: {
      hostname: process.env.SITE_URL || "http://127.0.0.1:5173"
    },
    appearance: false,
    markdown: {
      config: (md) => {
        md.use(imageFigures, {
          figcaption: 'alt',
          lazy: true,
          dataType: true
        })
        // 此处不再有任何 footnote 相关代码
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
            { text: '中共十一大', link: '/11' },
            { text: '中共十二大', link: '/12' },
            { text: '中共十三大', link: '/13' }
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