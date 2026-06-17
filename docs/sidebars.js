/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category', label: 'Getting Started',
      items: ['guides/quickstart', 'guides/self-hosting'],
    },
    {
      type: 'category', label: 'Guides',
      items: ['guides/custom-rails'],
    },
    {
      type: 'category', label: 'API Reference',
      items: ['api/sdk-reference'],
    },
  ],
}
module.exports = sidebars
