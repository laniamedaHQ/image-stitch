# Laniameda — Native Tools for AI Creators

Laniameda is a suite of lightweight, browser-based tools built for people who create with AI image generators. No accounts, no installs — just open and work.

## The Problem

AI image tools like Midjourney, DALL-E, and Flux are powerful but lack the surrounding workflow tooling that creators need. You end up bouncing between Figma, Photoshop, random stitching websites, and your browser tabs just to do basic image prep. Every extra step breaks your creative flow.

## The Product

**Laniameda Image Stitch** (`image-stitch`) is the first tool in the Laniameda suite. It's a smart image workspace for cropping, locking, editing, and stitching images — purpose-built for AI workflows.

---

## Use Cases

### 1. Midjourney Editor Workflow

Midjourney is a diffusion model. It relies heavily on the amount of context you give it. When you want to make a small, precise edit on a large canvas, the model takes in everything surrounding your edit area — and the result often drifts from your intent.

**The Laniameda workflow solves this:**

1. Open your full image in the Editor
2. Draw a crop region around the specific area you want to edit
3. Lock the crop so it stays in position
4. Export just that cropped area
5. Paste it into Midjourney's editor for precise, isolated diffusion
6. When the edit is done, import the result back and it snaps into the locked crop region
7. Stitch the edited area back into the original full image — seamlessly

This gives you **surgical control** over Midjourney edits that would otherwise be impossible on a full canvas.

### 2. Fast Image Stitching

Sometimes you need to combine multiple images into one — fast. Reference sheets, comparison grids, composite mood boards. Doing this in Figma is slow and messy.

**With Smart Stitch:**

1. Drag and drop your images into the workspace
2. Smart Stitch auto-arranges them into a justified layout
3. Configure width, row height, and spacing
4. Export one clean PNG — ready to paste into any AI tool

No artboards, no alignment tools, no export dialogs. Just drag, stitch, copy.

### 3. Color Palette Brainstorming

When you're working on AI creative projects — designing websites, building visual identities, exploring aesthetics — you need to iterate on color fast.

**Color Explorer lets you:**

- Pick a base color or randomize
- Generate full palettes instantly
- Preview how colors look in real typography and UI
- Use it as a lightweight design system reference

Native color brainstorming without leaving your AI creative workflow.

---

## Companion Product: Laniameda Storage

**[laniameda.storage](https://laniameda.storage)** is the companion app — a prompt and image library that lives in Telegram.

### How it works:

1. **Sign up** on the web dashboard
2. **Connect your Telegram bot** (we set it up for you)
3. **Send anything to the bot** — prompts, images, references, ideas
4. The bot (an AI agent) saves everything to your personal dashboard
5. **Browse your library** on the web — search, copy prompts, reuse images
6. **Opt-in sharing** — keep your library private or share prompts with the community

### What you can do:

- Save any prompt or image instantly from Telegram
- Transfer styles between images
- Replace characters across variations
- Copy and reuse prompts with one click
- Build a personal prompt library over time

**Coming soon:** Direct image generation from the dashboard — create, iterate, and save without leaving Laniameda.

---

## Vision

Every AI creator deserves native tools — fast, frictionless, purpose-built for the way diffusion models actually work. Laniameda is building the creative workflow layer that AI image tools are missing.

**Image Stitch** handles the visual workspace.
**Storage** handles the prompt and asset library.

Together, they make AI creative work flawless.

---

## Tech

- React + TypeScript + Vite
- Tailwind CSS v4
- Runs entirely in the browser — no server, no uploads, no tracking
- All image processing happens client-side via Canvas API
