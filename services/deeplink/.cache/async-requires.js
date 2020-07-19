// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---src-pages-404-tsx": () => import("./../../src/pages/404.tsx" /* webpackChunkName: "component---src-pages-404-tsx" */),
  "component---src-pages-buckets-share-tsx": () => import("./../../src/pages/buckets/share.tsx" /* webpackChunkName: "component---src-pages-buckets-share-tsx" */),
  "component---src-pages-index-tsx": () => import("./../../src/pages/index.tsx" /* webpackChunkName: "component---src-pages-index-tsx" */)
}

