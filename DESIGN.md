---
name: Particle Sculpture
description: Fine point sculptures with editorial serif typography, inherited from api.lmm.best.
colors:
  poster-ground: "#0b100e"
  ink: "#f3ecdf"
  muted: "#b4bbae"
  line: "#424b42"
  accent: "#d4b48b"
  light-poster-ground: "#f1ede4"
  light-ink: "#222d25"
  light-muted: "#566252"
  light-line: "#b1b9aa"
  light-accent: "#73482a"
typography:
  display:
    fontFamily: "Bodoni, Georgia, serif"
    fontSize: "clamp(52px, 6.4vw, 92px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-.035em"
  title:
    fontFamily: "Bodoni, Georgia, serif"
    fontSize: "26px"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.6
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.6
spacing:
  control-gap: "28px"
  navigation-gap: "32px"
components:
  control:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    padding: "10px 0"
  control-selected:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "10px 0"
  project-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  wordmark:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  interaction-hint:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
---

# Design System: Particle Sculpture

## Overview

**Creative North Star: "Fine point field, editorial serif"**

Preserve the api.lmm.best particle identity: recognizable three-dimensional subjects built from fine points, with Bodoni headlines and a quiet surrounding interface. The sculpture supplies color, depth and movement; the page uses an open ground and restrained text controls.

**Key Characteristics:**
- A live point field with brush displacement and spring recovery.
- Green-black and warm-paper themes, with editorial serif emphasis.
- Flat framing, generous empty space and visible control labels.

## Colors

The frontmatter records the five CSS properties in each theme; light mode replaces their values through the root `light` class.

### Primary
- **Warm sand / warm brown** (`accent` / `light-accent`): italic headline emphasis, link hover, selected-control underline, selection and keyboard focus.

### Neutral
- **Green-black / warm paper** (`poster-ground` / `light-poster-ground`): the page and the exact Canvas ground.
- **Paper ink / deep green ink** (`ink` / `light-ink`): headlines, wordmark, navigation and active controls.
- **Sage text** (`muted` / `light-muted`): supporting copy, inactive controls and attribution.
- **Quiet green rule** (`line` / `light-line`): header and footer separators.

Apple reds and greens, and bird blues and cream, belong to the procedural subjects rather than the interface palette. Light mode preserves their hue while deepening their rendered tones.

## Typography

Bodoni Moda is self-hosted as `Bodoni`, with Georgia and serif fallbacks. It appears in the wordmark and regular-weight display headline; the emphasized subject word is italic and uses the accent. System sans carries copy and controls. Supporting copy is limited to 32ch on desktop; the interaction hint uses the label role, and footer attribution uses 12px.

## Layout

Desktop uses page gutters of 5.2vw, a 96px header and an 81px minimum footer. The main area has 34% / 66% columns, with copy beside the Canvas and controls spanning both columns. The stage height is `max(420px, calc(100svh - 278px))`; scene controls sit left and theme/pause controls right.

At 700px and below, gutters become 6vw, the header becomes 76px, and copy, stage and controls stack. The wordmark becomes 21px and the display uses `clamp(48px, 12vw, 70px)` with natural wrapping. Copy and controls become 13px, the stage is 360px high with a 300px minimum, and controls may wrap. Only the skill link remains in the top navigation; footer attribution stacks. The 390px and 320px captures show this layout without horizontal overflow.

## Elevation & Depth

The interface has no shadows or raised surfaces. Thin rules frame the page. Depth comes from the sculpture's projected geometry, shading, occlusion and point motion; trails blend with the current Canvas ground.

## Shapes

The interface uses text, straight rules and underlines, without cards or rounded containers. Sculpture silhouettes are organic but rendered on a fine square lattice: 2.7 CSS pixels normally, 1.7 when the Canvas width is below 680px.

## Components

- **Text controls:** transparent background and a 44px minimum hit height. Hover and `aria-pressed="true"` brighten the text and reveal a one-pixel accent underline. Disabled controls use 0.6 opacity. Links and buttons share a two-pixel accent focus outline with a six-pixel offset; there is no CSS transition.
- **Project navigation:** plain text links with small authored SVG arrows. The wordmark is an unadorned serif home link. Footer links retain a thin underline.
- **Point field and hint:** the hint is centered near the stage bottom and changes with pause/reduced-motion state. Apple turns once in 16 seconds; bird wings flap at 1.5 cycles per second. Auto sequence holds each subject for seven seconds, then disperses/reforms over 1.6 seconds. Pointer or single-finger movement displaces real points, which spring back after release. Pause and reduced motion stop continuous animation; vertical scrolling and pinch zoom remain native.

## Do's and Don'ts

### Do:
- **Do** keep the Canvas ground identical to the page ground in both themes.
- **Do** preserve visible labels, keyboard focus, pause, reduced motion and native mobile gestures.

### Don't:
- **Don't** replace the live point field with an image or an unrelated visual effect.
- **Don't** add cards or decorative data widgets to this showcase.

Extracted from `index.html`, `examples/apple-bird/`, `assets/runtime/` and the six final captures in `.impeccable/review/`. The surface composition remains documented in `.impeccable/surfaces/apple-bird.md`.
