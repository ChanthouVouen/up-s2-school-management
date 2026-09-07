// This folder used to be one large file. It's now split into:
//   - shared.tsx           shared small pieces (badges, layout shell, form field, info row)
//   - ApplicationsList.tsx the /applications list page
//   - ApplicationDetail.tsx the /applications/:id detail page
// This file just re-exports both, so existing imports like
// `import ApplicationsPage, { ApplicationDetailPage } from '.../pages/admin/applications'` keep working.

export { default } from './ApplicationsList';
export { ApplicationDetailPage } from './ApplicationDetail';
