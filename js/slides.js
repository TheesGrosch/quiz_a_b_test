/* =====================================================================
   PRÄSENTATION – Reihenfolge und Inhalte aller Folien
   ---------------------------------------------------------------------
   Jede Folie ist ein Objekt mit `type`. Reihenfolge hier = Reihenfolge
   in der Präsentation. Texte könnt ihr direkt hier ändern.

   Folientypen:
     cover           Startfolie (A | B, Titel, Namen)
     quiz-lobby      QR-Code + Live-Zähler
     section         Zwischentitel
     quiz-result     echtes Ergebnis eines Fallbeispiels + wie viele richtig lagen
     steps-rows      zwei Spalten, Zeile für Zeile per Leertaste (z. B. „Vorgehen“)
     surprise        „Ihr wart Teil eines A/B-Tests“
     quiz-hypothesis Hypothese + Team A vs. Team B + Ja/Nein
     steps-visual    Punkte links nacheinander, rechts wechselt das Bild (z. B. „Grenzen“)
     split           Titel + linke und rechte Hälfte mit freiem HTML
     sources         Quellenliste
     html            komplett freie Folie: { type:'html', html:'…' }

   Animationen in freiem HTML:
     class="a a1" … "a a5"   erscheint beim Aufrufen der Folie (gestaffelt)
     data-step="2"           erscheint ab dem 2. Druck auf Leertaste/→
     data-only="2"           ist NUR bei Schritt 2 sichtbar
   ===================================================================== */

const DECK = {
  footer: 'A/B Testing'
};

/* ---------- kleine Grafiken (Wireframes) ---------- */
function phoneSVG(kind) {
  const lines = '<rect x="12" y="12" width="44" height="5" rx="2.5" fill="#E6E5E2"/><rect x="12" y="23" width="26" height="5" rx="2.5" fill="#E6E5E2"/>';
  let body = '';
  if (kind === 'outline') body = '<rect x="12" y="98" width="56" height="13" rx="6.5" fill="none" stroke="#fff" stroke-width="2.5"/>';
  if (kind === 'filled')  body = '<rect x="12" y="98" width="56" height="13" rx="6.5" fill="#fff"/>';
  if (kind === 'redesign') {
    return `<svg viewBox="0 0 92 128" class="phone"><rect x="3" y="7" width="76" height="116" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/>
      <rect x="12" y="16" width="58" height="30" rx="2" fill="#DEDDDA"/><circle cx="62" cy="24" r="4" fill="#A5A3A0"/>
      <rect x="12" y="54" width="58" height="5" rx="2.5" fill="#DEDDDA"/><rect x="12" y="64" width="42" height="5" rx="2.5" fill="#DEDDDA"/>
      <rect x="12" y="78" width="58" height="19" rx="3" fill="#fff"/><rect x="12" y="104" width="58" height="6" rx="3" fill="#DEDDDA"/>
      <circle cx="79" cy="8" r="7.5" fill="#fff"/></svg>`;
  }
  return `<svg viewBox="0 0 92 128" class="phone"><rect x="3" y="3" width="74" height="120" rx="9" fill="none" stroke="#fff" stroke-width="2.5"/>${lines}${body}</svg>`;
}
function abPair(a, b) {
  return `<div class="abpair"><div class="abph">${phoneSVG(a)}<span class="abl sans">A</span></div><div class="abph">${phoneSVG(b)}<span class="abl serif">B</span></div></div>`;
}
const WATCH_SVG = `<svg viewBox="0 0 140 140" class="watch"><rect x="50" y="2" width="40" height="26" rx="5" fill="#DEDDDA"/><rect x="50" y="112" width="40" height="26" rx="5" fill="#DEDDDA"/>
  <rect x="30" y="22" width="80" height="96" rx="18" fill="#D2CDC4" stroke="#fff" stroke-width="3"/><rect x="109" y="56" width="5" height="16" rx="2" fill="#fff"/>
  <circle cx="70" cy="70" r="9" fill="#fff"/>
  <path d="M20 46 Q10 70 20 94 M11 40 Q-1 70 11 100 M122 46 Q132 70 122 94 M131 40 Q143 70 131 100" fill="none" stroke="#E6E5E2" stroke-width="2.2" stroke-linecap="round"/></svg>`;

/* ---------- Folien ---------- */
const SLIDES = [

  // 1 · Start
  { type: 'cover', a: 'A', b: 'B', title: 'Testing', names: 'Thees, Lars' },

  // 2 · Quiz-Screen mit QR-Code
  { type: 'quiz-lobby',
    kicker: 'Interaktiv',
    title: 'Kurzes Quiz zu echten A/B-Tests',
    text: 'Scannt den QR-Code mit dem Handy. Drei Fragen, etwa zwei Minuten – kein Wettbewerb, nehmt euch Zeit.' },

  // 3 · Quiz-Auswertung
  { type: 'section', title: 'Quiz-Auswertung' },

  // 4–6 · echte Ergebnisse (Leertaste zeigt dann, wie viele von euch richtig lagen)
  { type: 'quiz-result', q: 'q1', brand: 'Ehrenkind',
    numbers: [['+2,14 %', 'Bestellungen'], ['+8,48 %', 'ARPU']] },
  { type: 'quiz-result', q: 'q2', brand: 'yfood',
    numbers: [['−6,06 %', 'Bestellungen'], ['−5,00 %', 'ARPU']] },
  { type: 'quiz-result', q: 'q3', brand: 'Berliner Zeitung',
    numbers: [['+18,23 %', 'digitale Abschlüsse'], ['+333,90 %', 'Micro-Conversions']],
    note: 'Gewinner: Nr. 4 – weißes Pop-up über dem Artikel' },

  // 7 · Vorgehen (jede Zeile per Leertaste)
  { type: 'steps-rows', title: 'Vorgehen', leftLabel: 'Vor dem Test', rightLabel: 'Beispiele',
    rows: [
      { h: 'Problemstatement', p: 'Ziel des A/B Testings festlegen',
        right: abPair('outline', 'filled') },
      { h: 'Hypothese', p: 'Welche Erfolge erwartet man? z.B. Conversion Rate oder Newsletter-Sign-ups erhöhen',
        right: '<h4>Beispielhypothese</h4><p>„Wenn wir eine Änderung an <span class="box">X</span> vornehmen, wird sich das <span class="box">wie?</span> auf <span class="box">Y</span> auswirken.“</p>' },
      { h: 'Design des A/B Testings', p: 'Welche Parameter werden geändert?',
        right: '<h4>Beispiele für Änderungen</h4><p>UX/UI: Layout, Farben, Text oder Bilder ändern<br>Backend: Machine-Learning-Algorithmen, Recommendations updaten</p>' }
    ] },

  // 8 · Überraschung
  { type: 'surprise', kicker: 'Überraschung!', lines: ['Ihr wart Teil', 'eines A/B-Tests.'],
    saw: {
      A: ['Regler von 0 bis 20 %', 'Stern bei „Gesunken“', 'Keine Bildunterschriften'],
      B: ['Regler von 0 bis 40 %', 'Kein Stern', 'Wertende Bildunterschriften']
    } },

  // 9 · Auswertung des Tests
  { type: 'section', title: 'Auswertung des Tests' },

  // 10–12 · Hypothesen (Leertaste zeigt Ergebnis + Ja/Nein)
  { type: 'quiz-hypothesis', q: 'q1', brand: 'Ehrenkind',
    hypothesis: 'Team A mit dem kleineren Regler schätzt besser.',
    saw: { A: 'Regler 0–20 %', B: 'Regler 0–40 %' } },
  { type: 'quiz-hypothesis', q: 'q2', brand: 'yfood',
    hypothesis: 'Team A mit dem Stern bei der richtigen Antwort hat mehr richtig.',
    saw: { A: 'Stern bei „Gesunken“', B: 'kein Stern' } },
  { type: 'quiz-hypothesis', q: 'q3', brand: 'Berliner Zeitung',
    hypothesis: 'Team A ohne die Beschreibungen hat mehr richtig.',
    saw: { A: 'keine Bildunterschriften', B: 'wertende Bildunterschriften' } },

  // 13 · Grenzen der Methode (Punkte nacheinander, rechts wechselt das Bild)
  { type: 'steps-visual', title: 'Grenzen der Methode',
    items: [
      { h: 'Nur kleine Schritte', p: 'Welches Element hat für Erfolg gesorgt?',
        visual: `<div class="wfgrid">${abPair('outline', 'filled')}${abPair('outline', 'redesign')}</div>` },
      { h: 'Lediglich datenbasiert', p: '• Gefühle, Emotionen, Nutzerbegeisterung nicht messbar',
        visual: '<img class="vimg wide" src="img/amazon-prime.jpg" alt="Amazon-Prime-Angebot im Checkout">' },
      { h: 'Große Sample Size notwendig', p: '',
        visual: `<div class="calc"><img class="vimg" src="img/sample-size-rechner.jpg" alt="Sample-Size-Rechner von Optimizely">
          <div class="anno"><span>10 %</span><svg viewBox="0 0 60 120"><path d="M8 6 C60 20 60 100 10 112" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M18 104 L8 112 L20 117" fill="none" stroke="#fff" stroke-width="2.4"/></svg><em>+20 %</em><span>12 %</span></div></div>` },
      { h: 'Nur Bestehendes testbar', p: '',
        visual: '<img class="vimg" src="img/yfood-ergebnis.jpg" alt="yfood A/B-Test mit Ergebnis">' }
    ] },

  // 14 · Übertragung in unseren Kurs
  { type: 'split', title: 'Übertragung in unseren Kurs',
    left: '<h3 class="bigleft">Klassisches A/B Testing<br>schwer anwendbar</h3>',
    right: `<div class="kursR">
      <div class="ksub">Smartwatch · ÖPNV</div>
      <h3>App für blinde Menschen</h3>
      <ul>
        <li><b>Feedback-Art:</b><ul><li>A Vibrationsmuster vs. B Ton / Sprache</li></ul></li>
        <li><b>Informationsmenge:</b><ul><li>A kurz vs. B ausführlich</li></ul></li>
        <li><b>Messen:</b><ul><li>Erfolgsquote/Fehler, Reaktionszeit, Puls…</li></ul></li>
      </ul></div>${WATCH_SVG}` },

  // 15 · Quellen
  { type: 'sources', title: 'Quellen &<br>KI-Nutzung',
    links: [
      'https://www.youtube.com/watch?v=zFMgpxG-chM',
      'https://www.youtube.com/watch?v=vV3g5VuSrIQ',
      'https://omr.com/de/reviews/contenthub/ab-testing-beispiel',
      'https://www.optimizely.com/tools/sample-size-calculator?conversion=11&effect=33&significance=95',
      'https://www.malwarebytes.com/ru/blog/news/2025/09/amazon-pays-2-5b-settlement-over-deceptive-prime-subscriptions',
      'https://www.classaction.org/blog/ftc-slams-amazon-with-lawsuit-over-prime-subscriptions-heres-what-you-need-to-know'
    ],
    text: 'KI-Nutzung: Claude, (5.11 und 6.11.2026) zur Erstellung von den kleinen Grafiken auf der rechten Seite, Unterstützung beim coding des A/B-Test-Quizes (seitens Backend/Auswertung der Werte bei der “Auflösung”. Zudem als Hilfe für die Erstellung der Animationen für die slides.<br>Unser Beitrag: Komplettes Design der Folien, alle Infos auf den Folien kommen aus unserem Research (kein Einsatz von KI für Informationen), Unsere eigene konkrete Idee eines interaktiven Quizes + Auflösung,' }
];
