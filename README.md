# VM 2026 tippekonkurranse

Dette er en statisk VM 2026-tippekalkulator som kan deles med venner. Den lagrer utkast lokalt i nettleseren mens brukeren fyller ut tipset, og kan sende ferdige tips til **Netlify Forms** når siden hostes på Netlify.

## Anbefalt produksjonsoppsett: Netlify

Netlify er valgt fordi prosjektet er statisk og ikke trenger egen backend eller database for første versjon av konkurransen.

1. Legg repoet på GitHub.
2. Opprett en Netlify-konto.
3. Velg **Add new site** → **Import an existing project**.
4. Koble til GitHub-repoet.
5. Bruk disse innstillingene:
   - **Build command:** tomt felt
   - **Publish directory:** `.`
6. Deploy siden.
7. Åpne Netlify-dashboardet → **Forms** og kontroller at skjemaet `vm-2026-tips` finnes etter første deploy.

Appen inneholder et skjult Netlify-skjema i `index.html` og `vm-2026-tipping.html`. Når en bruker trykker **Send inn tips**, sender JavaScript en URL-encoded POST til Netlify Forms. Innsendingen inneholder både regnearkvennlige enkeltfelt og en komplett `payloadJson` som backup.

## Hente ut tips

1. Gå til Netlify-dashboardet for siden.
2. Åpne **Forms**.
3. Velg skjemaet `vm-2026-tips`.
4. Se innsendte tips direkte i Netlify eller eksporter dem som CSV.
5. Importer CSV-en i Excel eller Google Sheets for poengberegning.

Viktige felt i eksporten:

- `firstName`, `lastName`, `email` og `submittedAt`
- `groupPredictionsCompact` med alle gruppespilltips i ett kompakt felt
- `knockoutPicksCompact` med alle sluttspillvalg i ett kompakt felt
- `bonusAnswersCompact` med alle bonusspørsmål i ett kompakt felt
- `champion`, `championId` og `totalGroupGoals`
- `payloadJson` med komplett state fra appen (backup for videre analyse)


## Feilsøking av Netlify-innsending

Hvis brukeren får `Netlify svarte med 404` ved innsending, betyr det normalt at Netlify ikke behandlet POST-en som en kjent form submission. Sjekk dette i rekkefølge:

1. Gå til Netlify-dashboardet → **Forms** og kontroller at `vm-2026-tips` ligger under aktive skjemaer.
2. Kontroller at **Form detection** ikke er deaktivert i Netlify. Netlify behandler ikke nye eller endrede skjemaer hvis form detection er slått av.
3. Kontroller at skjemaet ikke er slettet i Netlify. Hvis et skjema slettes, vil nye innsendinger til det skjemaet kunne gi 404.
4. Deploy siste versjon fra GitHub på nytt etter endringer i `index.html` eller `vm-2026-tipping.html`.
5. Test fra den publiserte Netlify-lenken, ikke fra lokal `file://`-åpning eller GitHub-visning.

Appen poster nå til samme path som brukeren står på, slik at både `/` og direkte lenker til `/vm-2026-tipping.html` bruker en side hvor det skjulte Netlify-skjemaet faktisk finnes.

## Lokal testing uten innsending

Du kan fortsatt teste appen helt lokalt uten Netlify:

1. Last ned eller kopier hele prosjektmappen til maskinen din.
2. Åpne prosjektmappen i Finder/Utforsker.
3. Dobbeltklikk på `vm-2026-tipping.html`.
4. Nettleseren åpner appen lokalt fra filsystemet.
5. Endringer lagres i nettleserens `localStorage` på din maskin.

Merk: **Send inn tips** fungerer først når siden er deployet på Netlify, fordi den da poster til Netlify Forms. Ved lokal filåpning kan innsending feile, men lokal utfylling og lagring fungerer fortsatt.

## Lokal server for utvikling

Hvis du har terminal tilgjengelig, kan appen kjøres med:

```bash
npm run dev
```

Åpne deretter `http://localhost:5173` i nettleseren.

## Syntax check

```bash
npm run check
```

Dette kjører `node --check src/tournament.js && node --check src/main.js`.

## Oppdatere single-file-versjonen

`vm-2026-tipping.html` er den delbare alt-i-ett-filen. Når du endrer `index.html`, `src/styles.css`, `src/tournament.js` eller `src/main.js`, regenerer den med:

```bash
npm run build
```

## Hvis siden ikke fungerer lokalt

Prøv dette i rekkefølge:

1. Slett den gamle nedlastingen og last ned ZIP-filen på nytt hvis du lastet ned en eldre versjon.
2. Pakk ut ZIP-filen først. Ikke åpne filene direkte inni ZIP-visningen.
3. Åpne `vm-2026-tipping.html` i den utpakkede mappen.
4. Hvis du heller åpner `index.html`, kontroller at `index.html` ligger ved siden av `src`-mappen.
5. Bruk en moderne nettleser som Chrome, Edge, Firefox eller Safari.
