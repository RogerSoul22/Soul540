# Chat Voice Input Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a microphone button to the Chat page that uses the Web Speech API to transcribe speech into the input field for user review before sending.

**Architecture:** A `useRef<SpeechRecognition>` holds the recognition instance. A `listening` boolean state drives the button appearance. On `onresult`, the transcript is appended to the existing input value. No backend changes needed.

**Tech Stack:** React + TypeScript, Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), SCSS Modules.

---

### Task 1: Add mic button styles to Chat.module.scss

**Files:**
- Modify: `src/frontend/pages/Chat/Chat.module.scss`

**Step 1: Add `.micBtn` and `.micBtnActive` styles and `@keyframes pulse` after the `.sendBtn` block**

```scss
.micBtn {
  background: transparent;
  color: $muted;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    color: $text;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.micBtnActive {
  color: #ef4444;
  border-color: #ef4444;
  animation: micPulse 1.2s ease-in-out infinite;
}

@keyframes micPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}
```

**Step 2: Verify the file looks correct**

Open `src/frontend/pages/Chat/Chat.module.scss` and confirm `.micBtn`, `.micBtnActive`, and `@keyframes micPulse` are present after `.sendBtn`.

**Step 3: Commit**

```bash
git add src/frontend/pages/Chat/Chat.module.scss
git commit -m "style(chat): add micBtn and micBtnActive styles"
```

---

### Task 2: Wire up SpeechRecognition in Chat.tsx

**Files:**
- Modify: `src/frontend/pages/Chat/Chat.tsx`

**Step 1: Add `listening` state and `recognitionRef` after existing state declarations (after `const bottomRef`)**

```typescript
const [listening, setListening] = useState(false);
const recognitionRef = useRef<SpeechRecognition | null>(null);

const SpeechRecognitionAPI =
  (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
    .SpeechRecognition ||
  (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
    .webkitSpeechRecognition;
```

**Step 2: Add `toggleMic` function after `handleSuggestion`**

```typescript
function toggleMic() {
  if (!SpeechRecognitionAPI) return;

  if (listening) {
    recognitionRef.current?.stop();
    return;
  }

  const rec = new SpeechRecognitionAPI();
  rec.lang = 'pt-BR';
  rec.continuous = false;
  rec.interimResults = false;

  rec.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
  };

  rec.onend = () => setListening(false);
  rec.onerror = () => setListening(false);

  recognitionRef.current = rec;
  rec.start();
  setListening(true);
}
```

**Step 3: Add mic button JSX inside `inputBar`, between `<input>` and the send `<button>`**

Replace the existing form:
```tsx
<form className={styles.inputBar} onSubmit={handleSubmit}>
  <input
    className={styles.input}
    value={input}
    onChange={e => setInput(e.target.value)}
    placeholder="Pergunte algo sobre o sistema..."
    disabled={loading}
    autoFocus
  />
  {SpeechRecognitionAPI && (
    <button
      type="button"
      className={`${styles.micBtn}${listening ? ` ${styles.micBtnActive}` : ''}`}
      onClick={toggleMic}
      disabled={loading}
      title={listening ? 'Parar gravação' : 'Falar'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {listening ? (
          <>
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </>
        ) : (
          <>
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </>
        )}
      </svg>
    </button>
  )}
  <button className={styles.sendBtn} type="submit" disabled={loading || !input.trim()}>
    Enviar
  </button>
</form>
```

**Step 4: Verify the page renders and the mic button appears**

Run the dev server (`npm run dev` from `src/frontend/` or `npm run dev:main` at root) and open the Chat page. Confirm the mic button appears, changes to a red stop square when clicked, and stops when clicked again. Transcribed text should appear in the input field.

**Step 5: Commit**

```bash
git add src/frontend/pages/Chat/Chat.tsx
git commit -m "feat(chat): add voice input via Web Speech API"
```
