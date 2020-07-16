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
  ],
};
