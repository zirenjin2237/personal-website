---
title: "DopaMine"
subtitle: "A context-aware screen limiter that knows when you have an exam"
date: "2026"
authors:
  - "Ziren Jin"
  - "Jordan Wang"
  - "Anji Feng"
  - "Tony Yao"
status: "First Prize, UMich × Oracle AI Hackathon"
summary: "An LLM agent in iMessage reads your deadlines, calendar and screen use, then picks how strongly to step in: from no action up to blocking an app until you send a photo of your work."
order: 3
tags:
  - LLM agents
  - Hackathon

links:
  demo: "https://dopamine-debug-console.streamlit.app/"
---

## The idea

Most screen-time limits are fixed timers: one hour of social media, then you are locked out, on a quiet Sunday and the night before a midterm alike. We wanted a limiter that uses context. DopaMine gives an LLM a small framework for personal time management. It looks at your deadlines and your day, then decides whether you are relaxing or doomscrolling before an exam.

DopaMine took first place at the hackathon. It was the first hackathon for all four of us. I built the data APIs and the agent debug console; the four of us designed the agent workflow together.

![The DopaMine team](./figures/team.jpg "The DopaMine team: Ziren Jin, Jordan Wang, Anji Feng and Tony Yao.")

## How it works

DopaMine runs a sense–think–act loop.

| Step | What happens |
| --- | --- |
| Sense | A data API collects Canvas deadlines, calendar events, screen usage and the time of day. |
| Think | The LLM receives these signals with a decision matrix in its prompt and picks one of four urgency levels. The judgment is the LLM's own; there is no separate scoring model yet. |
| Act | Level 0: no action. Level 1: a notification by iMessage. Level 2: vibration. Level 3: the app is blocked until you pass a work check. |

![DopaMine workflow: sense, think, act](./figures/workflow.jpg#wide "Sense: collect Canvas, screen usage, circadian clock and calendar data. Think: the LLM, with a decision matrix in its prompt, picks one of four urgency levels. Act: no action, notification, vibration, or an app block that unlocks after a work check.")

The [live agent debug console](https://dopamine-debug-console.streamlit.app/) shows the agent's reasoning step by step.

## Since the hackathon

DopaMine now runs inside iMessage. To unlock a blocked app, you send a photo of yourself working or of what you finished. The LLM's judgment can be wrong, so a force-unlock is always available and a bad call never locks you out.

## Looking back

We built DopaMine as a hackathon project and did not expect personal agents to grow so fast. Since then, large companies have shipped their own.

Building one made privacy concrete for me. To judge a single moment, DopaMine reads my deadlines, my calendar, my screen use, and, to unlock an app, a photo of my desk or my work. Each signal made its decisions better, and each one is something I would not hand to a stranger. A personal agent works well only when it sees a lot of your life, so where that data goes and how long it is kept matter as much as how good its decisions are. We did not solve this in DopaMine. It is the question I would start from next time.
