# RhythmIN Design System

## Product personality

RhythmIN should feel like a crafted music instrument rather than a generic AI dashboard: dark-room atmosphere, tactile controls, visible audio motion, concise production language, and a clear sense of flow from source to finished track.

## Visual principles

1. **Use glass selectively.** Navigation, overlays, floating transport, and project surfaces may be translucent. Dense editors should remain readable and stable.
2. **Use neumorphism for touch points.** Faders, pads, toggles, transport buttons, and instrument controls can use inset depth. Never use soft shadows as the only affordance.
3. **Show cause and effect.** Slider changes, mute/solo, playhead movement, meter activity, and job states should provide immediate feedback.
4. **Prefer real content.** Empty states should explain the next action. Avoid invented analytics or decorative labels that do not help the user.
5. **Keep the product light.** Avoid large libraries for small interactions; lazy-load heavy audio and instrument code.

## Tokens

- Midnight `#080C14`
- Graphite `#111827`
- Slate `#64748B`
- Cloud `#E8EEF7`
- Electric blue `#3B82F6`
- Cyan highlight `#22D3EE`
- Violet accent `#8B5CF6`
- Success `#22C55E`
- Warning `#F59E0B`
- Error `#EF4444`

## Typography

Use a readable sans-serif for body and controls. Use the expressive Clash-style reference only for brand accents, short section labels, and hero emphasis. Numeric values and audio metadata use a monospace face for scanability.

## Motion

- Button press: 100–160ms.
- Panel and tab transitions: 180–260ms.
- Rich motion only for occasional events or audio-reactive visuals.
- Animate opacity and transform, not layout dimensions.
- Respect `prefers-reduced-motion`.

## Accessibility

All controls need accessible names, visible focus, keyboard access, readable contrast, and state text that does not rely on color alone. File upload, sliders, tabs, playback, and theme changes are core keyboard flows.
