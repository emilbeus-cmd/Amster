import { readFile, writeFile } from 'node:fs/promises'

const [indexHtml, styles, tournamentScript, mainScript] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('src/styles.css', 'utf8'),
  readFile('src/tournament.js', 'utf8'),
  readFile('src/main.js', 'utf8'),
])

const html = indexHtml
  .replace(/\s*<link rel="stylesheet" href="\.\/src\/styles\.css" \/>/, `\n    <style>\n${styles}\n    </style>`)
  .replace(/\s*<script defer src="\.\/src\/tournament\.js"><\/script>/, `\n    <script>\n${tournamentScript}\n    </script>`)
  .replace(/\s*<script defer src="\.\/src\/main\.js"><\/script>/, `\n    <script>\n${mainScript}\n    </script>`)

await writeFile('vm-2026-tipping.html', html)
console.log('Built vm-2026-tipping.html')
