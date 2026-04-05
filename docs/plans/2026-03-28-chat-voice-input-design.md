# Chat Voice Input — Design

**Date:** 2026-03-28
**Scope:** `src/frontend/pages/Chat/` (main system only)

## Summary

Add a microphone button to the Chat page that uses the Web Speech API (`SpeechRecognition`) to transcribe speech to text. The transcribed text is placed in the input field for the user to review before sending manually.

## Approach

Web Speech API (native browser). No dependencies, no cost, no backend changes required. Works in Chrome/Edge. Button is hidden silently if browser does not support `SpeechRecognition`.

## UI

- Microphone SVG button added to the `inputBar`, to the left of the "Enviar" button.
- Idle state: neutral color, same size/shape as send button.
- Active (listening) state: red color, pulsing animation (`.micBtnActive`).

## Logic (Chat.tsx)

- `listening: boolean` state.
- `useRef<SpeechRecognition>` to hold the instance across renders.
- Config: `lang = 'pt-BR'`, `continuous = false`, `interimResults = false`.
- `onresult`: appends transcript to existing input value.
- `onend`: sets `listening = false`.
- If `window.SpeechRecognition` and `window.webkitSpeechRecognition` are both undefined, button is not rendered.

## Styles (Chat.module.scss)

- `.micBtn`: same dimensions as `.sendBtn`, neutral background.
- `.micBtnActive`: red border/icon, `pulse` keyframe animation.

## Files Changed

- `src/frontend/pages/Chat/Chat.tsx`
- `src/frontend/pages/Chat/Chat.module.scss`
