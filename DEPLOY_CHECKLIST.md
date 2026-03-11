# Pre-Deployment Checklist

## Before Pushing to Main

### Code Quality
- [ ] TypeScript build passes: `pnpm build`
- [ ] No TypeScript errors: `pnpm lint`
- [ ] No console errors in browser

### Critical User Flows (Manual Test)
- [ ] **Graph View loads** — Open Graph Editor, no blank page
- [ ] **Form View loads** — Open Form View, no errors
- [ ] **Add nodes** — Can add world/character/beat
- [ ] **Auto-zoom works** — View fits new nodes
- [ ] **API key button** — Click "Add API Key", expands settings
- [ ] **Story generation** — With API key, can generate story
- [ ] **Co-Pilot chat** — Can interact with Visual Co-Pilot

### Error Handling
- [ ] **No API key** — Shows helpful error, not crash
- [ ] **Invalid API key** — Shows recovery options
- [ ] **Network error** — Graceful fallback

### Responsive
- [ ] **Desktop** — Works on 1440px+
- [ ] **Tablet** — Works on 768px
- [ ] **Mobile** — Works on 375px (or acceptable degradation)

---

## If Any Check Fails

**DO NOT PUSH TO MAIN**

1. Fix the issue
2. Re-run checklist
3. Only then push

---

## After Pushing to Main

Vercel will auto-deploy. Verify:
- [ ] Deploy succeeds (check Vercel dashboard)
- [ ] Production URL works: https://spectator-seven.vercel.app
- [ ] Run critical flows again on production
