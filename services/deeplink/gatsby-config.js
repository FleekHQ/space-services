module.exports = {
  siteMetadata: {
    title: 'Space: Decentralized Storage App',
    description:
      'Upload, back up, and share files in a privacy first application',
    keywords:
      'storage, files, upload, share, privacy, decentralized, p2p, ipfs',
    siteUrl: 'https://space.storage',
    author: {
      name: 'Daniel Merrill',
      email: 'daniel@fleek.co',
    },
  },
  pathPrefix: '__GATSBY_IPFS_PATH_PREFIX__',
  plugins: [
    'gatsby-transformer-json',
    'gatsby-plugin-fontawesome-css',
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Work Sans:400,500`],
        display: 'swap',
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: /svgs/,
        },
      },
    },
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: 'https://space.storage',
      },
    },
    'gatsby-plugin-emotion',
    'gatsby-plugin-typescript',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-ipfs',
    {
      resolve: 'gatsby-plugin-load-script',
      options: {
        src:
          'https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.0.2/dist/ponyfill.min.js',
      },
    },
  ],
};
