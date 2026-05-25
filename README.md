# Forsikringsduell – lokal demo

En enkel, demobar web-app som kjører lokalt uten hosting/backend.

## Kjøring

1. Åpne `index.html` direkte i nettleseren (dobbelklikk eller `file://.../index.html`).
2. Last opp PDF-er for tilbyder X og Y (filnavn vises i demoen).
3. Fyll inn nøkkeldata for Hus, Innbo, Reise og Barn for begge tilbydere.
4. Fyll inn totalpris (årspris) for X og Y.
5. Svar på 10 standardspørsmål.
6. Trykk **Beregn anbefaling**.

## Hva demoen gjør

- Krever sammenligning av alle fire forsikringstyper.
- Gir tydelig anbefaling: **Velg X** eller **Velg Y**.
- Viser kort begrunnelse med prisforskjell, vekting pris/dekning og sterke match-punkter.

## Viktig om PDF i denne offline MVP-en

Denne versjonen bruker PDF-opplasting som dokumentasjonssteg i flyten, men gjør ikke full automatisk tekstuttrekk fra PDF uten eksterne biblioteker. Derfor fylles nøkkeldata inn manuelt i skjema.
