# Projekt: A/B-Testing-Präsentation mit Live-Quiz

Statische Website (GitHub Pages), kein Build-Schritt, kein Framework. Sprache der Inhalte: Deutsch.

## Architektur
- `index.html` lädt `js/qrcode.min.js`, `js/quiz.js`, `js/slides.js`, `js/app.js` (in dieser Reihenfolge, globale Konstanten `QUIZ`, `DECK`, `SLIDES`).
- `#host` im URL-Hash → Präsentationsmodus (Beamer). `?s=<topic>` → Handy-Quiz.
- Datenübertragung: ntfy.sh Pub/Sub. Handy: `POST {relay}/{topic}` mit JSON `{t:'j'|'a', p:pid, g:'A'|'B', a:{q1,q2,q3}}`. Beamer: SSE `…/sse?since=all`, Fallback Polling `…/json?poll=1&since=all`. `?relay=` überschreibt den Server (lokale Tests).
- Folien: `RENDER[type]` in `app.js` erzeugt HTML je Folientyp. Inhalte stehen ausschließlich in `slides.js`.
- Schritte innerhalb einer Folie: `data-step="n"` (sichtbar ab Schritt n), `data-only="n"` (nur bei Schritt n). Anzahl Schritte = größtes n.
- Einblend-Animation beim Folienwechsel: Klassen `a a1`…`a a5`.
- Layout der Folien in `rem`; die Folie ist 100rem × 56,25rem (16:9), `body.host` setzt `font-size: min(1vw, 1.7778vh)`.
- Titel mit Schriftwechsel in der Mitte: `split(text)` → `.splitT` (links Helvetica Neue bold, rechts IBM Plex Serif).

## Konventionen
- Design: links Grün `--green`, rechts Grau `--gray` (siehe `:root` in `css/style.css`). Team A = links/grün/Grotesk, Team B = rechts/grau/Serif.
- Pro Quizfrage unterscheidet sich zwischen A und B genau ein Gestaltungselement.
- Auswertung: „richtig“ via `isCorrect()`, Signifikanz via `fisher()` (zweiseitig).
- Nach Änderungen testen: lokal `python3 -m http.server`, `/#host` öffnen, „Probelauf mit Testdaten“ einschalten und alle Folien mit → durchklicken.
