# Spectator

**A Relational Narrative Engine for AI-Driven Content Creation**

Spectator is an open-source framework that treats storytelling like a physics simulation. Instead of prompting an LLM to "write a story" and suffering from narrative drift, Spectator decouples the underlying **World Events** from the **Camera** (how the story is told).

Designed for animators, indie filmmakers, and game developers, Spectator generates structured, cohesive narrative data — complete with emotional pacing trajectories and multi-threaded timelines — ready to be piped into your creative frontend.

## Why Spectator?

Current AI story generation is fundamentally broken. It relies on sequential text generation, coupling the events of the world with the delivery of the narrative. This results in:

- **Loss of State** — Characters forget items, motivations, or physical locations.
- **Flat Pacing** — The emotional arc is left to chance.
- **Rigid Delivery** — You cannot easily tell a story out of chronological order (e.g., *Memento*) or switch perspectives without regenerating the entire prompt.

Spectator solves this by building a **graph-based narrative pipeline**.

## Core Features

### Decoupled Architecture: World vs. Camera (Fabula & Syuzhet)

Spectator separates the raw chronological events (the **World State**) from the narrative delivery. Generate a persistent world history, then attach different "Cameras" to render that history via flashbacks, interleaving, or different character POVs.

### Emotional Trajectory Mapping

Define a target emotional curve (e.g., rising tension, sudden dread, catharsis). The Camera agent queries the World Event graph to select and sequence events that best fit your pacing constraints.

### Multi-Stream Timelines

World events exist as independent, concurrent streams.

- **Diverge** — Simulate multiple parallel character arcs.
- **Converge** — Bring characters together into shared event nodes.

Spectator visualizes these trajectories natively, allowing creators to see exactly where character paths intersect.

### Explicit vs. Implicit Threading

Design complex thrillers and mysteries with ease. Tag events as **Explicit** (what the viewer sees on screen) or **Implicit** (what happens in the shadows). The engine ensures rigorous state consistency, guaranteeing that the hidden plot never contradicts the main plot.

## Architecture

Spectator is a multi-agent orchestration pipeline backed by a relational state manager.

| Component | Role |
|---|---|
| **Engine** (Backend) | High-performance state machine managing the graph database of entities, relationships, and chronological events |
| **Director** (Orchestrator) | AI agent that maps World Events to the Emotional Trajectory and determines Camera output |
| **Canvas** (Visualizer) | Node-based visualization layer that renders converging/diverging streams and Explicit/Implicit threads in real-time |

## Quick Example

An event defined independently from the Camera — structured for rendering engines, not just text readers:

```json
{
  "event_id": "EVT_084_BETRAYAL",
  "chronological_timestamp": 4500,
  "location": "LOC_NEON_ALLEY",
  "stream_tags": ["arc_protagonist", "arc_syndicate"],
  "visibility": "IMPLICIT",
  "world_state_changes": {
    "character_01_status": "injured",
    "item_042_ledger_possession": "character_02"
  },
  "emotional_delta": {
    "tension": "+0.8",
    "hope": "-0.5"
  },
  "raw_action": "Character 02 strikes Character 01 from the shadows and steals the ledger."
}
```

Because this event is tagged as `IMPLICIT`, the Camera will not show it to the viewer at timestamp 4500, but the World State is updated. A later `EXPLICIT` event will reveal the consequences.

## Roadmap

- [x] Core state machine and JSON schema definition
- [ ] Multi-agent orchestration layer (World Builder vs. Director)
- [ ] Timeline visualization for Explicit/Implicit threads
- [ ] Integration plugins for Unity/Unreal Engine sequencer

## License

MIT
