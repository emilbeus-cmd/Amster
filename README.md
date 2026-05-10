# VM 2026 tippekonkurranse

Dette er en helt statisk webapp. Du trenger ikke Node, npm, Python, terminal eller andre programmeringsverktøy for å prøve den lokalt.


## Last ned prosjektmappen til PC

### Fra GitHub i nettleseren

1. Åpne GitHub-siden for prosjektet i nettleseren.
2. Trykk på den grønne `Code`-knappen.
3. Velg `Download ZIP`.
4. Finn ZIP-filen i `Nedlastinger`/`Downloads`.
5. Høyreklikk ZIP-filen og velg `Pakk ut alle` på Windows, eller dobbeltklikk ZIP-filen på Mac.
6. Åpne den utpakkede mappen og dobbeltklikk på `vm-2026-tipping.html`.

### Hvis noen sender deg prosjektet

1. Be om hele prosjektmappen eller en ZIP-fil av prosjektmappen.
2. Pakk ut ZIP-filen hvis du mottar en ZIP.
3. Dobbeltklikk helst på `vm-2026-tipping.html`. Denne filen inneholder alt og er minst feilutsatt.
4. Alternativt kan du dobbeltklikke på `index.html`, men da må `index.html` ligge ved siden av `src`-mappen.

## Test uten programmeringsverktøy

1. Last ned eller kopier hele prosjektmappen til maskinen din.
2. Åpne prosjektmappen i Finder/Utforsker.
3. Dobbeltklikk på `vm-2026-tipping.html`.
4. Nettleseren åpner appen lokalt fra filsystemet. Du kan også bruke `index.html` hvis `src`-mappen ligger ved siden av.
5. Tipp resultatene gruppe for gruppe. Endringene lagres i nettleserens `localStorage` på din maskin.

> Anbefalt: bruk `vm-2026-tipping.html` for lokal testing. Den er en selvstendig fil med HTML, CSS og JavaScript samlet. Hvis du bruker `index.html`, må du beholde `index.html` og `src`-mappen ved siden av hverandre.


## Hvis det ikke fungerer

Prøv dette i rekkefølge:

1. Slett den gamle nedlastingen og last ned ZIP-filen på nytt hvis du lastet ned før denne feilen ble rettet.
2. Pakk ut ZIP-filen først. Ikke åpne filene direkte inni ZIP-visningen.
3. Åpne `vm-2026-tipping.html` i den utpakkede mappen. Dette er den tryggeste måten fordi alt ligger i én fil.
4. Hvis du heller åpner `index.html`, kontroller at `src`-mappen ligger i samme mappe som `index.html`.
5. Bruk en moderne nettleser som Chrome, Edge, Firefox eller Safari.
6. Hvis siden fortsatt er blank: høyreklikk på `vm-2026-tipping.html`, velg `Åpne med`, og velg nettleseren din.

## Valgfri lokal server

Hvis du likevel har terminal tilgjengelig, kan appen også kjøres med:

```bash
npm run dev
```

Dette er bare et alternativ. Dobbeltklikk på `vm-2026-tipping.html` er nok for vanlig testing.
