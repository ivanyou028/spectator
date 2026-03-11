# Spectator PM Roadmap

> **Last Updated:** 2026-03-11 05:51 GMT+8
> **Current Phase:** Foundation (Week 1)
> **Status:** Setting up autonomous operations

---

## Current Priorities (This Week)

### P0: Critical Path
- [x] **Deploy Web Playground** — Deployed to Vercel
  - URL: https://spectator-seven.vercel.app
  - Status: ✅ Live
  
- [x] **Fix Visual Blockers** — Coding agent completed
  - Status: ✅ Done — overlapping cards fixed, auto-resize textareas, story visible
  
- [ ] **Fix UX Blockers** — API key onboarding design + implementation
  - Status: 🔄 Coding agent implementing UX design (60 min timeout)
  - Design: ✅ Complete — sticky banner + error recovery
  - Implementation: 🔄 In progress
  
- [ ] **QA Verification** — Final check after all fixes
  - Blocked on: UX implementation complete
  
- [ ] **Record Demo Video** — 60-90 second GIF/video for README
  - Blocked on: UX fixes deployed

### P1: High Impact
- [ ] **README Makeover** — Add live demo link, better hero section
- [ ] **Create Examples Repo** — `spectator-examples` with 5 starter projects
- [ ] **Social Setup** — Twitter/X account for Spectator

### P2: Foundation
- [ ] **Blog Setup** — Enable blog in VitePress docs
- [ ] **Discord Server** — Create community hub
- [ ] **Issue Triage** — Label "good first issue" on 5 issues

---

## Phase Timeline

| Phase | Dates | Goal | Key Deliverables |
|-------|-------|------|------------------|
| **Foundation** | Mar 11 - Apr 8 | Remove friction | Live demo, README video, examples |
| **Content** | Apr 9 - May 20 | SEO & authority | 6 blog posts, YouTube series |
| **Community** | May 21 - Jul 1 | Social growth | Discord, story jams, contributors |
| **Scale** | Jul 2 - Sep 9 | Ecosystem | Integrations, partnerships |

---

## Sub-Agent Task Queue

### Ready to Spawn
| Task | Agent Type | Est. Time | Dependencies |
|------|------------|-----------|--------------|
| Create API proxy serverless function | Code | 30 min | None |
| README rewrite draft | Content | 45 min | None |
| Blog post #1 draft | Content | 1 hr | None |
| Examples repo structure | Code/setup | 30 min | None |
| VitePress blog config | Code | 20 min | None |

### Recently Completed
| Task | Completed | Notes |
|------|-----------|-------|
| Web playground code audit | 2026-03-11 | Found missing API proxy — needs fix before deploy |
| Fix API proxy security | 2026-03-11 | Removed server-side key fallback, users bring own keys |
| Deploy to Vercel | 2026-03-11 | Live at https://spectator-seven.vercel.app |

### In Progress
| Task | Started | Agent | Notes |
|------|---------|-------|-------|
| Fix UI Blockers | 2026-03-11 | Coding agent | Overlapping cards, truncated text, missing story output |
| QA System Fix | 2026-03-11 | PM (me) | Updated testing agent with visual-first criteria, hard blockers |

### Blocked on User
| Task | Blocker | Notes |
|------|---------|-------|
| Deploy to Vercel | Need Vercel API key or auth | Can prep everything else |
| Twitter/X account | Need account access or creation | Can draft content meanwhile |
| Discord server | Need ownership transfer or co-admin | Can prep channels/docs |

---

## Metrics Tracking

| Metric | Current | Target (Week 4) | Target (Week 10) |
|--------|---------|-----------------|------------------|
| GitHub Stars | TBD | 100 | 500 |
| NPM Downloads/wk | TBD | 50 | 200 |
| Discord Members | 0 | 50 | 200 |
| Blog Posts | 0 | 2 | 6 |

---

## Autonomous Actions Log

### 2026-03-11
- ✅ Cloned repo, analyzed codebase
- ✅ Created PM_STRATEGY.md
- ✅ Set up ROADMAP.md (this file)
- ✅ Updated MEMORY.md with PM role
- ✅ Spawned sub-agent: Web playground audit
- ✅ Fixed API proxy to remove server-side key fallback (security)
- ✅ Deployed to Vercel: https://spectator-seven.vercel.app
- ✅ Spawned testing agent with isolated API key
- ✅ Created testing agent memory system (visual-first criteria)
- ✅ Fixed false positive — improved testing criteria
- ✅ Created coding agent with persistent memory
- ✅ Fixed UI blockers: overlapping cards, truncated text, story visibility
- ✅ Created UX design agent for UX reviews
- ✅ Documented full agentic system in AGENTS.md
- 🔄 UX agent designing API key onboarding
- 🔄 Next: Implement UX design, final QA, demo recording

---

## User Blockers Log

| Date | Blocker | Resolution |
|------|---------|------------|
| 2026-03-11 | Vercel API key needed for deployment | ✅ Resolved — deployed successfully |

---

## Notes to Self

- Check this roadmap daily during heartbeats
- Spawn sub-agents for parallel work when possible
- Update metrics weekly
- Don't let perfect be enemy of shipped
- Remember: Live demo is the linchpin for everything
- **Testing agent has isolated API key** — don't share with other agents
