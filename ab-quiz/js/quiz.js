/* =====================================================================
   QUIZ-FRAGEN  (das sehen die Leute auf dem Handy)
   ---------------------------------------------------------------------
   Team A = „gutes“ Design, Team B = „schlechtes“/neutrales Design.
   Pro Frage ist genau EIN Gestaltungselement zwischen A und B anders.

   kind:
     "slider" – Schieberegler; Skala je Team über max: {A:…, B:…}
                richtig = höchstens `tolerance` Prozentpunkte daneben
     "choice" – Antwortmöglichkeiten; star: {A:'…'} = dezenter Stern
                bei dieser Antwort (Team ohne Eintrag sieht keinen)
     "tiles"  – Screens zum Antippen; Nummern 1–4 ergeben sich aus der
                Reihenfolge in `options`; captionsFor = Team mit
                Bildunterschriften
   ===================================================================== */

const QUIZ = [
  {
    id: 'q1', kind: 'slider', brand: 'Ehrenkind', img: 'img/ehrenkind.jpg',
    intro: 'Ehrenkind hat die mobile Navigation umgebaut: Variante B zeigt direkt die Produktkategorien statt „Shop, Story, Jobs …“.',
    ask: 'Um wie viel Prozent ist der durchschnittliche Umsatz pro Nutzer (ARPU) mit Variante B gestiegen?',
    max: { A: 20, B: 40 },
    correct: 8.48,
    tolerance: 2,
    correctLabel: '8,48 %'
  },
  {
    id: 'q2', kind: 'choice', brand: 'yfood', img: 'img/yfood.jpg',
    intro: 'yfood hat Social Proof auf die Produktseite gesetzt: Variante B nennt Fritz Meinecke, Survival Mattin und 500.000 Kund:innen.',
    ask: 'Wie haben sich die Bestellungen mit Variante B verändert?',
    options: [
      { id: 'stark',    label: 'Stark gestiegen (mehr als +5 %)' },
      { id: 'leicht',   label: 'Leicht gestiegen (0 bis +5 %)' },
      { id: 'kaum',     label: 'Kaum verändert' },
      { id: 'gesunken', label: 'Gesunken' }
    ],
    star: { A: 'gesunken' },
    correct: 'gesunken',
    correctLabel: 'Gesunken'
  },
  {
    id: 'q3', kind: 'tiles', brand: 'Berliner Zeitung',
    intro: 'Die Berliner Zeitung hat ihre Paywall in vier Designs gegeneinander getestet.',
    ask: 'Welche Variante hat die meisten digitalen Abo-Abschlüsse gebracht?',
    options: [
      { id: 'original', img: 'img/bz-original.jpg', caption: 'Ursprünglicher Screen' },
      { id: 'abo',      img: 'img/bz-abo.jpg',      caption: 'Übersichtliche Darstellung der Abo-Optionen' },
      { id: 'blau',     img: 'img/bz-blau.jpg',     caption: 'Blaues Pop-up' },
      { id: 'weiss',    img: 'img/bz-weiss.jpg',    caption: 'Weißes Pop-up' }
    ],
    captionsFor: 'B',
    correct: 'weiss',
    correctLabel: 'Nr. 4 – weißes Pop-up'
  }
];
