# VM 2026 tippekonkurranse

Dette er en helt statisk webapp. Du trenger ikke Node, npm, Python, terminal eller andre programmeringsverktøy for å prøve den lokalt.


## Last ned prosjektmappen til PC

### Fra GitHub i nettleseren

1. Åpne GitHub-siden for prosjektet i nettleseren.
2. Trykk på den grønne `Code`-knappen.
3. Velg `Download ZIP`.
4. Finn ZIP-filen i `Nedlastinger`/`Downloads`.
5. Høyreklikk ZIP-filen og velg `Pakk ut alle` på Windows, eller dobbeltklikk ZIP-filen på Mac.
6. Åpne den utpakkede mappen og dobbeltklikk på `index.html`.

### Hvis noen sender deg prosjektet

1. Be om hele prosjektmappen eller en ZIP-fil av prosjektmappen.
2. Pakk ut ZIP-filen hvis du mottar en ZIP.
3. Sjekk at `index.html` ligger ved siden av `src`-mappen.
4. Dobbeltklikk på `index.html` for å starte appen i nettleseren.

## Test uten programmeringsverktøy

1. Last ned eller kopier hele prosjektmappen til maskinen din.
2. Åpne prosjektmappen i Finder/Utforsker.
3. Dobbeltklikk på `index.html`.
4. Nettleseren åpner appen lokalt fra filsystemet.
5. Tipp resultatene gruppe for gruppe. Endringene lagres i nettleserens `localStorage` på din maskin.

> Viktig: behold `index.html` og `src`-mappen ved siden av hverandre. `index.html` laster CSS og JavaScript fra `src`-mappen.

## Valgfri lokal server

Hvis du likevel har terminal tilgjengelig, kan appen også kjøres med:

```bash
npm run dev
```

Dette er bare et alternativ. Dobbeltklikk på `index.html` er nok for vanlig testing.
