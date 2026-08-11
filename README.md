# „Gintarėlis“ svetainė

Visos gamybai parengta svetainė Klaipėdos lopšelio-darželio „Giliukas“ – „Gintarėlio“ skyriui.

## Technologijos

- HTML5 (semantinis, prieinamas)
- TailwindCSS (per CDN)
- ES6 modulių „Vanilla JavaScript“
- Paprastas Node.js serveris statiniam turiniui
- JSON pagrindu veikianti turinio saugykla

## Paleidimas

```bash
npm install   # tik testavimo priemonėms, pvz. puppeteer-core
npm start
```

Pagal numatymą serveris veikia `http://localhost:8080` (prievadą galima pakeisti: `PORT=3000 npm start`).

## Turinio valdymas

Svetainės turinys saugomas faile `data/content.json` – redaguokite jį tiesiogiai,
o pakeitimai automatiškai atsispindės viešoje svetainėje po puslapio perkrovimo.

## Dokumentai

Atsisiunčiami PDF dokumentai saugomi `assets/documents/`:

- `ikimokyklinio-ugdymo-programa.pdf`
- `priesmokyklinio-ugdymo-programa.pdf`

## SEO

Svetainėje yra:

- meta žymos ir Open Graph / Twitter Cards,
- `robots.txt`,
- `sitemap.xml`,
- schema.org `Preschool` struktūrizuoti duomenys.

## Mobilus dizainas ir prieinamumas

- Pilnai prisitaikantis išdėstymas (desktop, laptop, tablet, mobile).
- ARIA žymos, klaviatūros navigacija, fokuso indikatoriai.
- Semantinis HTML, tinkama antraščių hierarchija.
- `loading="lazy"` nuotraukoms ir sumažintas judesys su `prefers-reduced-motion`.

## Pastabos

- „Facebook“ naujienų skiltyje naudojamas oficialus Facebook puslapio įskiepis (iframe). Jei įskiepis neveiks, rodomas atsarginis pranešimas su nuoroda į puslapį.
- „Google“ atsiliepimų skiltis rodo `content.json` faile įvestus atsiliepimus ir bendrą įvertinimą; ateityje galima prijungti oficialų Google Places API.
