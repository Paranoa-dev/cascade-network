// @ts-check
const { themes } = require('prism-react-renderer')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cascade Network',
  tagline: 'Stellar Disbursement Platform extension SDK',
  url: 'https://docs.cascade-network.dev',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      'classic',
      {
        docs: { sidebarPath: require.resolve('./sidebars.js'), routeBasePath: '/' },
        blog: false,
        theme: { customCss: require.resolve('./src/css/custom.css') },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Cascade Network',
      items: [{ href: 'https://github.com/cascade-network', label: 'GitHub', position: 'right' }],
    },
    prism: { theme: themes.github, darkTheme: themes.dracula },
  },
}

module.exports = config
