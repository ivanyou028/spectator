# Spectator — Roadmap to 5K Stars

## Current State

Spectator is a well-engineered TypeScript narrative engine (v0.1.0) with strong fundamentals: structured story output as typed data, a draft-critique-revise pipeline, dual-level streaming, character state tracking, narrative memory, multi-provider support (Claude/OpenAI), a web playground, CLI, and an agent framework. The documentation site, test suite, and monorepo structure are all solid for a project at this stage.

The gap between "well-built library" and "5K-star project" is almost entirely about **discoverability, demo-ability, and ecosystem fit**. Most developers will never read the source — they'll see a 30-second demo, try a hosted playground, or find the project via an integration with a tool they already use.

---

## Priority 1: Ship a Killer Public Demo (the "wow" moment)

**Why this matters most:** Open-source projects live or die on their first impression. The web playground exists but requires local setup or a Vercel deploy with your own API key. There is no single link a developer can click to *see* Spectator in action. Without that, the README is just a wall of text — no matter how good.

**What to do:**
- Deploy a **public hosted playground** (spectator.dev or similar) with rate-limited shared API access so anyone can generate a story in 30 seconds without setup
- Record a **30-second GIF/video** showing token-level streaming, the critique-revise cycle, and character state evolution for the README hero section
- Add 2-3 curated **one-click example stories** (e.g., "Generate a noir mystery," "Continue a fantasy epic") so first-time visitors see polished output immediately
- Make the README tell a story itself: lead with the demo link and GIF, not the feature list

**Success metric:** A developer who lands on the GitHub repo should go from "what is this?" to "whoa, that's cool" in under 30 seconds.

---

## Priority 2: Build the Integration that Finds Your Users (AI Agent / Game Dev ecosystem)

**Why this matters:** A standalone story engine is a niche tool. But a story engine that plugs into the workflows developers are *already excited about* — AI agents, game development, interactive fiction — becomes a must-have dependency. Meet developers where they are, not ask them to come to you.

**What to do:**
- Build a **LangChain/LangGraph tool** wrapper so any agent framework can call Spectator as a narrative tool (fastest path to discoverability in the current AI ecosystem)
- Create an **interactive fiction adapter** — a simple loop where the user makes choices and `story.continue()` branches the narrative based on input. This turns Spectator from "generate a story" into "play a story," which is 10x more shareable
- Add a **game engine integration example** (Unity C# via REST, or Godot/Phaser via the JS SDK) showing NPCs with dynamic backstories and evolving dialogue — game devs are a huge, underserved audience for structured narrative AI
- Publish a **"Build an AI Dungeon clone in 50 lines"** tutorial — the kind of content that gets shared on Hacker News and Twitter

**Success metric:** Spectator appears in "awesome-langchain," game dev forums, and interactive fiction communities as *the* narrative engine to use.

---

## Priority 3: Make the Contribution & Extension Story Irresistible

**Why this matters:** Projects that hit 5K stars don't get there from one author's commits. They get there because the community starts contributing presets, integrations, and examples. The extension surface (custom worlds, plot templates, character archetypes) is technically there but not *inviting*. Lower the barrier to contribution to near-zero and make contributing feel rewarding.

**What to do:**
- Create a **community presets registry** — a `presets/community/` directory where anyone can PR a new world, plot template, or character archetype with a simple JSON/TS file and a one-paragraph description. Make it the easiest first PR a new contributor can make
- Add **"good first issue" labels** with detailed descriptions for 10-15 tasks: new preset worlds (steampunk, horror, romance, historical), new plot templates (coming-of-age, heist, revenge), output format exporters (screenplay, EPUB, Twine), and provider adapters (Gemini, Mistral, Ollama/local models)
- Build a **plugin/middleware system** for the generation pipeline — let developers inject custom logic (content filters, style transfer, translation, brand voice) between draft/critique/revise stages without forking the core
- Add a **showcase page** to the docs site where community members can submit stories/apps built with Spectator — social proof drives stars

**Success metric:** At least 5 external contributors submit presets or integrations within the first month of launch, and the "good first issue" queue is actively worked.

---

## Summary

| Priority | Action | Impact Driver |
|----------|--------|---------------|
| **1. Public Demo** | Hosted playground + README GIF | Conversion: visitor → star |
| **2. Ecosystem Integrations** | LangChain tool, interactive fiction, game dev | Discovery: new audiences find you |
| **3. Contribution Flywheel** | Community presets, good-first-issues, plugin system | Retention: community grows the project |

The technical foundation is strong. The gap is entirely go-to-market. Ship the demo first — everything else depends on people being able to *see* what Spectator does.
