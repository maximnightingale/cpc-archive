import { defineConfig } from 'vitepress'
import imageFigures from 'markdown-it-image-figures'
import { defineLangConfig, withLangSearch } from 'vitepress-lang'
import { back2topPlugin } from 'vitepress-plugin-back2top'

const useCDN = process.env.USE_CDN === 'true'
const basePath = process.env.BASE_PATH || '/'
const cdnBase = 'https://cdn.jsdelivr.net/gh/maximnightingale/cpc-archive@gh-pages'

const fontPreloads = [
  ['link', { rel: 'preload', href: useCDN ? `${cdnBase}/fonts/%E6%96%B9%E6%AD%A3%E6%96%B0%E8%88%92%E4%BD%93.woff2` : '/fonts/方正新舒体.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: useCDN ? `${cdnBase}/fonts/TrajanPro3-Semibold.woff2` : '/fonts/TrajanPro3-Semibold.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: useCDN ? `${cdnBase}/fonts/%E5%8D%8E%E5%85%89%E6%AF%9B%E4%BD%93%E8%A1%8C%E6%A5%B7.woff2` : '/fonts/华光毛体行楷.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: useCDN ? `${cdnBase}/fonts/%E5%BA%B7%E7%86%99%E5%AD%97%E5%85%B8%E4%BD%93.woff2` : '/fonts/康熙字典体.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
  ['link', { rel: 'preload', href: useCDN ? `${cdnBase}/fonts/%E9%A9%AC%E5%96%84%E6%94%BF%E6%AF%9B%E7%AC%94%E6%A5%B7%E4%B9%A6.woff2` : '/fonts/马善政毛笔楷书.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }]
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
      ],
      build: {
        experimental: {
          renderBuiltUrl(filename, { hostType }) {
            if (useCDN) {
              return `${cdnBase}/${filename}`
            }
            return filename
          }
        }
      }
    }
  })
)