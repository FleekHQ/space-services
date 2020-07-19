const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---src-pages-404-tsx": hot(preferDefault(require("/Users/daniel/Projects/fleek/space-services/services/deeplink/src/pages/404.tsx"))),
  "component---src-pages-buckets-share-tsx": hot(preferDefault(require("/Users/daniel/Projects/fleek/space-services/services/deeplink/src/pages/buckets/share.tsx"))),
  "component---src-pages-index-tsx": hot(preferDefault(require("/Users/daniel/Projects/fleek/space-services/services/deeplink/src/pages/index.tsx")))
}

