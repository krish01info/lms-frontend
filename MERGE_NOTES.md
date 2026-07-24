# Merge notes — frontend

Base tree: friends' `lms frontend 20 07 2026` (most current).

Overlaid on top of that base, from your `frontend-notification-fix` branch, because
these were mock-data placeholders on friends' side or missing entirely:

| File | Why |
|---|---|
| `src/hooks/useNotifications.ts` | New file. Real hook: fetches `/notifications`, `/notifications/unread-count`, connects a Socket.IO client, live-invalidates on `notification:new`, exposes `markAsRead`/`markAllAsRead`/`remove`. Didn't exist on friends' side — they only had a mock `useNotifications()` returning static data from `mockData.ts`. |
| `src/hooks/useAdmin.ts` | New file. Real React Query hooks hitting `/admin/*` (dashboard stats, users, courses, payments) with mutations for update/status/delete. Matches your backend `admin.routes.js` exactly. |
| `src/components/layout/Navbar.tsx` | Uses `useNotifications()` for a live unread-count badge instead of a hardcoded `notificationCount = 5` prop. |
| `src/pages/admin/Dashboard.tsx` | Real API-driven (loading/error states via `useAdminDashboardStats`) instead of hardcoded `platformStats` mock numbers. |
| `src/pages/admin/Pages.tsx` | Yours is 496 lines of real, API-wired admin screens (users/courses/payments/reports/roles/settings/audit-logs) built against `useAdmin.ts`. Friends' version (135 lines) was static mock tables. |
| `src/pages/student/NotificationsPage.tsx` | Real data + actions via `useNotifications()`. |
| `src/types/index.ts` | Your `Notification` type matches the actual backend response (`isRead`, uppercase `NotificationType` enum, `userId`). Friends' had a different, backend-incompatible shape (`read: boolean`, lowercase `type` union) — kept yours since it's the one that will actually work against the real API. |

## Small manual fixes needed to reconcile the two
- `src/pages/teacher/Pages.tsx` — friends' branch had dropped the
  `export { NotificationsPage as TeacherNotificationsPage }` line. Restored it.
- `src/routes/index.tsx` — added back the `/teacher/notifications` and
  `/admin/notifications` routes (and their imports), which friends' branch had
  removed along with the above export.
- `src/constants/mockData.ts` — removed `mockNotifications` (used the old,
  backend-incompatible `Notification` shape: `read` instead of `isRead`, lowercase
  `type`). Fully superseded by the real API + socket data.
- `src/hooks/useData.ts` — removed the mock `useNotifications()` export that
  friends' branch had added (it collided in *purpose*, not name, with your real
  `hooks/useNotifications.ts` — nothing in the app imports the mock one, confirmed
  by grep before deleting).
- `package.json` — friends' was missing `socket.io-client`; added
  `"socket.io-client": "^4.8.3"` (the version pin from your branch). `sonner`
  (used for the toast-on-new-notification) was already present on friends' side.
- `.env.example` added for local dev (`VITE_API_URL`, `VITE_SOCKET_URL` pointing at
  `localhost:5000`). `.env.production` already had `VITE_SOCKET_URL` set correctly
  from friends' branch, so no change needed there.

Everything else (ai-tutor, gradebook, attendance, resources, announcements pages,
all teacher/student/parent pages besides the notification bits above) came from
**friends'** side unchanged.

## Verified
- `npx tsc --noEmit` — clean, zero errors across the whole merged app.
- `npx vite build` — production build succeeds (1420 modules, no errors).
- Confirmed (via grep) nothing else in the app referenced the mock
  `useNotifications`/`mockNotifications` before removing them.

## One thing to know
The main JS bundle is ~1.4 MB (426 KB gzipped) — Vite's default warning threshold
is 500 KB. This isn't something the merge introduced; it's pre-existing (large
page count, charting libs, etc.). Not blocking, just flagging in case you want to
code-split later with `React.lazy`/dynamic `import()` on the heavier pages
(AI Tutor, Gradebook, Charts).
