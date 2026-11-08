# A/B Testing – Präsentation mit Live-Quiz

Service Design · Hochschule München · Thees & Lars

Die komplette Präsentation läuft im Browser. Das Publikum macht per QR-Code ein Quiz auf dem Handy und wird dabei heimlich in Team A und Team B aufgeteilt. Später decken wir auf, dass es ein A/B-Test war, und werten ihn live aus.

## Präsentieren

1. Am Beamer-Rechner öffnen: `https://<github-name>.github.io/<repo>/#host`
2. `F` drücken für Vollbild.
3. Weiter mit **Leertaste, →, Enter** oder Presenter-Clicker, zurück mit **←**. `Pos1` springt zur ersten Folie.
4. Auf Folie 2 erscheint der QR-Code. Die Leute scannen ihn und landen automatisch im Quiz.

Wird die Seite neu geladen, bleibt sie auf der aktuellen Folie stehen. Die Antworten bleiben ebenfalls erhalten, etwa 12 Stunden lang.

**Steuerung unten links auf der QR-Folie:**
- *Probelauf mit Testdaten*: füllt alle Auswertungen mit 20 erfundenen Teilnehmenden, zum Üben.
- *Neue Session*: neuer QR-Code, alle Antworten zurückgesetzt. **Direkt vor der echten Präsentation einmal klicken**, damit keine Antworten aus der Generalprobe drin sind.

## Folienübersicht

| # | Folie | Klicks |
|---|---|---|
| 1 | Start (A / B / Testing) | – |
| 2 | Quiz mit QR-Code und Live-Zähler | – |
| 3 | Quiz-Auswertung | – |
| 4–6 | Echtes Ergebnis Ehrenkind, yfood, Berliner Zeitung | 2. Klick: wie viele richtig/falsch lagen |
| 7 | Vorgehen | jede Zeile einzeln |
| 8 | Überraschung: Ihr wart Teil eines A/B-Tests | – |
| 9 | Auswertung des Tests | – |
| 10–12 | Hypothese pro Fallbeispiel | 2. Klick: Team A vs. B + Ja/Nein |
| 13 | Grenzen der Methode | jeder Punkt einzeln, Bild rechts wechselt |
| 14 | Übertragung in unseren Kurs | – |
| 15 | Quellen & KI-Nutzung | – |

## Das Quiz (A/B-Test)

| Frage | Team A („gutes“ Design) | Team B |
|---|---|---|
| Ehrenkind (Regler) | Regler 0–20 % | Regler 0–40 % |
| yfood | dezenter grauer Stern bei „Gesunken“ | kein Stern |
| Berliner Zeitung | nur Nummern 1–4 | wertende Bildunterschriften |

- Richtig ist: 8,48 % (±2 Prozentpunkte zählen als richtig) · „Gesunken“ · Nr. 4 (weißes Pop-up)
- Die Teams werden automatisch etwa gleich groß aufgeteilt.
- **Ja/Nein** auf den Hypothesen-Folien: „Ja“, wenn Team A öfter richtig lag. Darunter steht, ob der Unterschied statistisch signifikant ist (exakter Test nach Fisher, p < 0,05). Bei ca. 20 Leuten ist er das oft nicht, das passt zu „Große Sample Size notwendig“.

## Dateien

```
index.html          Grundgerüst (nichts zu ändern)
css/style.css       Farben, Schriften, Layout aller Folien
js/slides.js        ← FOLIEN: Reihenfolge und alle Texte der Präsentation
js/quiz.js          ← QUIZ: Fragen, Varianten A/B, richtige Antworten
js/app.js           Technik (Quiz, Live-Daten, Navigation, Auswertung)
js/qrcode.min.js    QR-Code-Bibliothek
img/                alle Bilder
```

### Typische Änderungen

- **Text auf einer Folie ändern:** in `js/slides.js` den Text suchen und ersetzen.
- **Folie verschieben oder löschen:** in `js/slides.js` den Block `{ type: … }` verschieben oder löschen.
- **Neue Folie:** einen Block in `SLIDES` einfügen. Die verfügbaren Folientypen stehen oben in `js/slides.js`. Für eine ganz eigene Folie gibt es `{ type: 'html', html: '…' }`.
- **Bild austauschen:** neue Datei mit demselben Namen in `img/` legen. Die Bilder `amazon-prime.jpg` und `sample-size-rechner.jpg` sind aus Screenshots ausgeschnitten. Wenn ihr die Originale habt, einfach ersetzen.
- **Farben/Schriften:** ganz oben in `css/style.css`.

## Lokal testen

Im Repo-Ordner im Terminal:

```
python3 -m http.server 8000
```

Dann `http://localhost:8000/#host` öffnen. Für Handys funktioniert der QR-Code nur mit der GitHub-Pages-Adresse, weil „localhost“ vom Handy aus nicht erreichbar ist. Zum Üben reichen die Testdaten.

## Hinweise

- Die Antworten laufen über **ntfy.sh**, einen kostenlosen Dienst ohne Login. Pro Netzwerk gibt es ein Tageslimit von etwa 250 Nachrichten. Ein Durchgang mit 20 Leuten braucht ca. 60. Generalprobe also möglichst nicht am selben Tag im selben WLAN.
- Vor dem Quiz kurz sagen: „Bitte jeder für sich, nicht beim Nachbarn abgucken.“
- **Am Präsentationstag nichts mehr pushen.** Jede Änderung ist nach ca. 1 Minute live.
- Bildquellen der Fallbeispiele: growganic / OMR (siehe Quellenfolie).
