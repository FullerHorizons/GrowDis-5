# GrowDIS v5.0

A structured AI operating system designed to deliver precise, strategic, supportive, and creative responses across distinct modes.

## Overview

**Creator/Architect:** Fuller Horizons LLC

GrowDIS v5.0 integrates Rule 14 ("Present Reality Without Validation"), advanced reasoning techniques, and multi-mode capabilities to provide accurate, accountable AI interactions.

## Project Architecture

```
├── lib/
│   └── modes.ts          # Mode configurations and system prompts
├── pages/
│   ├── api/
│   │   └── chat.ts       # Chat API endpoint with streaming
│   ├── _app.tsx          # Next.js app wrapper
│   └── index.tsx         # Main chat interface
├── public/
│   └── logo.png          # GrowDIS logo
├── styles/
│   └── globals.css       # Global styles
└── attached_assets/      # Mode documentation files
```

## Available Modes

| Mode | Purpose | Rule 14 |
|------|---------|---------|
| **Executive** | Strategic analysis and decision support | Enforced |
| **Direct** | Concise, straightforward communication | Enforced |
| **Research** | Objective synthesis with citations | Enforced |
| **Creative** | Brainstorming and ideation | Partial |
| **Black Flag** | Blunt accountability and correction | Enforced |
| **Support** | Empathetic guidance and coaching | Not strict |

## Core Principles

1. **Rule 14**: Present Reality Without Validation - state objective facts without emotional cushioning
2. **Self-Critique Pass**: Every response is internally reviewed for accuracy and relevance
3. **Meta-Reasoning Overlay**: Detects ambiguity and ensures mode alignment

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Custom CSS with Tailwind utilities
- **AI**: OpenAI GPT-5 with streaming responses
- **Runtime**: Node.js

## Environment Variables

- `OPENAI_API_KEY` - Required for AI chat functionality

## Development

The application runs on port 5000. Use `npm run dev` to start the development server.

## Recent Changes

- November 28, 2025: Initial implementation of GrowDIS v5.0
  - Created multi-mode chat interface
  - Implemented all six operational modes
  - Added streaming chat responses
  - Integrated Rule 14 and self-critique logic
