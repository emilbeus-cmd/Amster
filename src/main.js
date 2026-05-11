(function () {
const {
  buildKnockoutBracket,
  buildQualifiers,
  buildRoundOf32,
  calculateTables,
  explainTieBreaker,
  getGroupProgress,
  groupIds,
  groupMatches,
  hasValidPrediction,
  roundLabels,
  teamById,
  teams,
} = window.Tournament

const STORAGE_KEY = 'vm-2026-tipping-state'

const bonusQuestions = [
  { id: 'mostGoalsTeam', label: 'Lag med flest mål totalt (hele turneringen)', suggestions: 'teams' },
  { id: 'mostConcededTeam', label: 'Lag som slipper inn flest mål totalt (hele turneringen)', suggestions: 'teams' },
  { id: 'scorelessTeam', label: 'Navngi ett lag som går ut av VM uten å score mål ("ingen" er gyldig svar)', suggestions: 'teamsWithNone' },
  { id: 'roughestTeam', label: 'Råtass-laget (flest poeng for gule og røde kort)', suggestions: 'teams' },
  { id: 'penaltyShootoutMatches', label: 'Antall sluttspillkamper som avgjøres på straffer (bruk tall, 0 er gyldig svar)', inputMode: 'numeric' },
  { id: 'mostPenaltiesTeam', label: 'Hvilket lag får flest straffer (ikke inkludert straffesparkkonkurranse)?', suggestions: 'teams' },
  { id: 'starGoals', label: 'Hvor mange mål skårer Mbappe, Kane og Haaland til sammen?', inputMode: 'numeric' },
  { id: 'youngPlayer', label: 'Vinner av FIFAs young player of the tournament' },
  { id: 'bestPlayer', label: 'Vinner av FIFAs best player of the tournament' },
]


const initialState = {
  activeGroup: 'A',
  predictions: {},
  knockoutWinners: {},
  customTeamNames: Object.fromEntries(teams.map((team) => [team.id, team.name])),
  bonusAnswers: Object.fromEntries(bonusQuestions.map((question) => [question.id, ''])),
  participant: { firstName: '', lastName: '', email: '' },
}

let state = loadState()

function cloneState(value) {
  return JSON.parse(JSON.stringify(value))
}

function readStoredState() {
  try {
    return window.localStorage?.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredState(nextState) {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(nextState))
  } catch {
    // Some browsers block localStorage for local files. The app still works for the current session.
  }
}

function loadState() {
  const raw = readStoredState()
  if (!raw) return cloneState(initialState)

  try {
    return normalizeState({ ...initialState, ...JSON.parse(raw) })
  } catch {
    return cloneState(initialState)
  }
}

function normalizeState(nextState) {
  return {
    ...nextState,
    activeGroup: groupIds.includes(nextState.activeGroup) ? nextState.activeGroup : 'A',
    customTeamNames: { ...initialState.customTeamNames, ...nextState.customTeamNames },
    bonusAnswers: { ...initialState.bonusAnswers, ...nextState.bonusAnswers },
    participant: { ...initialState.participant, ...nextState.participant },
  }
}

function persist(nextState, options = {}) {
  const viewport = options.preserveViewport ? captureViewport() : null
  state = normalizeState(nextState)
  writeStoredState(state)
  render()
  if (viewport) restoreViewport(viewport)
}

function captureViewport() {
  const activeElement = document.activeElement
  const dataset = activeElement?.dataset ?? {}
  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    selector: buildRestoreSelector(dataset),
    selectionStart: typeof activeElement?.selectionStart === 'number' ? activeElement.selectionStart : null,
  }
}

function buildRestoreSelector(dataset) {
  if (dataset.prediction && dataset.side) return `[data-prediction="${dataset.prediction}"][data-side="${dataset.side}"]`
  if (dataset.bonus) return `[data-bonus="${dataset.bonus}"]`
  if (dataset.participant) return `[data-participant="${dataset.participant}"]`
  return null
}

function restoreViewport(viewport) {
  requestAnimationFrame(() => {
    if (viewport.selector) {
      const nextElement = document.querySelector(viewport.selector)
      nextElement?.focus({ preventScroll: true })
      if (typeof viewport.selectionStart === 'number' && nextElement?.setSelectionRange) {
        nextElement.setSelectionRange(viewport.selectionStart, viewport.selectionStart)
      }
    }
    window.scrollTo(viewport.scrollX, viewport.scrollY)
  })
}

function displayName(teamId) {
  return state.customTeamNames[teamId] || teamById.get(teamId)?.name || 'Ukjent lag'
}

function setActiveGroup(group) {
  persist({ ...state, activeGroup: group })
}

function updatePrediction(matchId, side, value) {
  if (!/^\d{0,2}$/.test(value)) return
  persist({
    ...state,
    predictions: {
      ...state.predictions,
      [matchId]: {
        home: state.predictions[matchId]?.home ?? '',
        away: state.predictions[matchId]?.away ?? '',
        [side]: value,
      },
    },
    knockoutWinners: {},
  }, { preserveViewport: true })
}


function updateParticipant(field, value) {
  persist({
    ...state,
    participant: {
      ...state.participant,
      [field]: value,
    },
  }, { preserveViewport: true })
}


function updateBonusAnswer(questionId, value) {
  persist({
    ...state,
    bonusAnswers: {
      ...state.bonusAnswers,
      [questionId]: value,
    },
  }, { preserveViewport: true })
}

function calculatePredictedGroupGoals() {
  return Object.values(state.predictions).reduce((total, prediction) => {
    const homeGoals = parseBonusNumber(prediction.home)
    const awayGoals = parseBonusNumber(prediction.away)
    return total + homeGoals + awayGoals
  }, 0)
}

function parseBonusNumber(value) {
  if (value === undefined || value === null || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}


function getSuggestionOptions(question) {
  const teamOptions = teams.map((team) => state.customTeamNames[team.id] || team.name)
  const suggestionGroups = {
    teams: teamOptions,
    teamsWithNone: ['Ingen', ...teamOptions],
  }

  return [...new Set(suggestionGroups[question.suggestions] ?? [])].filter(Boolean)
}

function normalizeAutocompleteValue(value) {
  return value
    .trim()
    .toLocaleLowerCase('nb')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isExactSuggestion(question, value) {
  const normalizedValue = normalizeAutocompleteValue(value)
  return getSuggestionOptions(question).some((option) => normalizeAutocompleteValue(option) === normalizedValue)
}

function getMatchingSuggestions(question, value) {
  const normalizedValue = normalizeAutocompleteValue(value)
  if (!normalizedValue || isExactSuggestion(question, value)) return []

  return getSuggestionOptions(question)
    .filter((option) => isAutocompleteMatch(option, normalizedValue))
    .sort((a, b) => a.localeCompare(b, 'nb'))
    .slice(0, 5)
}

function isAutocompleteMatch(option, normalizedValue) {
  const normalizedOption = normalizeAutocompleteValue(option)
  return normalizedOption.startsWith(normalizedValue) || normalizedOption.split(/\s+/).some((part) => part.startsWith(normalizedValue))
}

function getFallbackSuggestions(question, value) {
  const normalizedValue = normalizeAutocompleteValue(value)
  if (!normalizedValue) return []

  return getSuggestionOptions(question)
    .map((option) => ({ option, distance: getEditDistance(normalizedValue, normalizeAutocompleteValue(option).slice(0, normalizedValue.length + 2)) }))
    .sort((a, b) => a.distance - b.distance || a.option.localeCompare(b.option, 'nb'))
    .slice(0, 3)
    .map(({ option }) => option)
}

function getEditDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  return dp[a.length][b.length]
}

function getBonusValidation(question, value) {
  if (!question.suggestions || !value.trim() || isExactSuggestion(question, value)) return ''
  const suggestions = getMatchingSuggestions(question, value)
  const fallbackSuggestions = suggestions.length ? suggestions : getFallbackSuggestions(question, value)
  return `Ugyldig svar. Mente du: ${fallbackSuggestions.join(', ')}?`
}

function renderBonusInput(question) {
  const value = state.bonusAnswers[question.id] ?? ''
  if (question.inputMode === 'numeric') {
    return `
      <input
        data-bonus="${question.id}"
        inputmode="numeric"
        value="${escapeAttribute(value)}"
        aria-label="${escapeAttribute(question.label)}"
      />
    `
  }

  const suggestions = getMatchingSuggestions(question, value)
  const validation = getBonusValidation(question, value)
  return `
    <div class="bonus-input-wrap">
      <input
        data-bonus="${question.id}"
        autocomplete="off"
        value="${escapeAttribute(value)}"
        aria-label="${escapeAttribute(question.label)}"
        aria-invalid="${validation ? 'true' : 'false'}"
        ${validation ? `aria-describedby="bonus-error-${question.id}"` : ''}
      />
      ${renderAutocompleteSuggestions(question, suggestions)}
      ${validation ? `<small class="bonus-error" id="bonus-error-${question.id}">${escapeHtml(validation)}</small>` : ''}
    </div>
  `
}

function renderAutocompleteSuggestions(question, suggestions) {
  if (!suggestions.length) return ''

  return `
    <div class="autocomplete-list" role="listbox" aria-label="Forslag">
      ${suggestions.map((suggestion) => `
        <button type="button" data-bonus-suggestion="${question.id}" data-suggestion-value="${escapeAttribute(suggestion)}" role="option">
          ${escapeHtml(suggestion)}
        </button>
      `).join('')}
    </div>
  `
}


function selectWinner(match, teamId, bracket) {
  const nextWinners = { ...state.knockoutWinners, [match.id]: teamId }
  const matchIndex = bracket.findIndex((candidate) => candidate.id === match.id)

  bracket.slice(matchIndex + 1).forEach((laterMatch) => {
    const validIds = [laterMatch.home?.team?.id, laterMatch.away?.team?.id]
    if (nextWinners[laterMatch.id] && !validIds.includes(nextWinners[laterMatch.id])) {
      delete nextWinners[laterMatch.id]
    }
  })

  persist({ ...state, knockoutWinners: nextWinners })
}

function goToRelativeGroup(direction) {
  const currentIndex = groupIds.indexOf(state.activeGroup)
  const nextIndex = Math.min(groupIds.length - 1, Math.max(0, currentIndex + direction))
  setActiveGroup(groupIds[nextIndex])
}

function resetAll() {
  persist(cloneState(initialState))
}

function render() {
  const app = document.querySelector('#root')
  if (!app) return
  const tables = calculateTables(state.predictions, state.customTeamNames)
  const qualifiers = buildQualifiers(tables)
  const roundOf32 = buildRoundOf32(qualifiers)
  const bracket = buildKnockoutBracket(roundOf32, state.knockoutWinners)
  const completedGroupMatches = groupMatches.filter((match) => hasValidPrediction(state.predictions[match.id])).length
  const champion = bracket.find((match) => match.id === 'M104')
  const championName = state.knockoutWinners.M104 ? displayName(state.knockoutWinners.M104) : 'Ikke kåret ennå'
  const activeProgress = getGroupProgress(state.activeGroup, state.predictions)

  app.innerHTML = `
    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">Deloitte · VM 2026 tippekonkurranse</p>
          <h1>Tipp én gruppe av gangen – se tabellen endre seg direkte</h1>
          <p>
            Fyll inn konkrete resultater, for eksempel 3–1 til Frankrike over Norge. Appen rangerer lagene gruppe for gruppe,
            bruker innbyrdes oppgjør der det er poenglikhet, og sender gruppevinnere, gruppetoere og de åtte beste treerne videre.
          </p>
        </div>
        <aside class="status-card">
          <span>${completedGroupMatches} / ${groupMatches.length}</span>
          <strong>gruppekamper tippet</strong>
          <small>Aktiv gruppe ${state.activeGroup}: ${activeProgress.completed}/${activeProgress.total} kamper</small>
          <small>Mester: ${escapeHtml(championName)}</small>
          ${champion?.home?.team && champion?.away?.team ? `<small>Finale: ${escapeHtml(champion.home.team.name)} – ${escapeHtml(champion.away.team.name)}</small>` : ''}
          <button data-action="reset">Nullstill demo</button>
        </aside>
      </section>

      <section class="panel participant-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Deltaker</p>
            <h2>Hvem leverer tipset?</h2>
          </div>
          <p>Fyll ut fornavn, etternavn og e-post før du deler eller leverer tipset.</p>
        </div>
        <div class="participant-grid">
          <label>
            <span>Fornavn</span>
            <input data-participant="firstName" value="${escapeAttribute(state.participant.firstName)}" autocomplete="given-name" aria-label="Fornavn" />
          </label>
          <label>
            <span>Etternavn</span>
            <input data-participant="lastName" value="${escapeAttribute(state.participant.lastName)}" autocomplete="family-name" aria-label="Etternavn" />
          </label>
          <label>
            <span>E-post</span>
            <input data-participant="email" type="email" value="${escapeAttribute(state.participant.email)}" autocomplete="email" aria-label="E-post" />
          </label>
        </div>
      </section>

      <section class="panel group-flow-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Steg 1 og 2</p>
            <h2>Tipp hele gruppe ${state.activeGroup} før du går videre</h2>
          </div>
          <p>
            Velg gruppe i rekkefølge A–L. Tabellen til høyre oppdateres etter hvert resultat og viser hvilken tie-breaker som er i bruk.
          </p>
        </div>
        ${renderGroupTabs()}
        ${renderActiveGroup(tables[state.activeGroup])}
      </section>

      <section class="panel rules-panel">
        <div>
          <p class="eyebrow">Tie-breakere</p>
          <h2>Reglene som hensyntas</h2>
        </div>
        <ol>
          <li>Poeng i gruppen.</li>
          <li>Total målforskjell i gruppen.</li>
          <li>Totalt scorede mål i gruppen.</li>
          <li>Innbyrdes poeng, innbyrdes målforskjell og innbyrdes scorede mål for lag som fortsatt står likt.</li>
          <li>Fair play finnes i FIFAs offisielle regler, men er bevisst ignorert i denne tippeappen.</li>
        </ol>
      </section>

      <section class="panel bonus-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Bonusspørsmål</p>
            <h2>Ekstra tips</h2>
          </div>
          <p>Disse svarene lagres sammen med resten av tipset ditt.</p>
        </div>
        ${renderBonusQuestions(calculatePredictedGroupGoals())}
      </section>

      <section class="panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Steg 3</p>
            <h2>Sluttspill</h2>
          </div>
          <p>Velg vinner i hver kamp. Neste runde fylles ut automatisk basert på valgene dine.</p>
        </div>
        <div class="bracket">
          ${['round32', 'round16', 'quarter', 'semi', 'final'].map((round) => renderRound(round, bracket)).join('')}
        </div>
      </section>
    </main>
  `

  app.querySelector('[data-action="reset"]')?.addEventListener('click', resetAll)
  app.querySelectorAll('[data-group]').forEach((button) => {
    button.addEventListener('click', (event) => setActiveGroup(event.currentTarget.dataset.group))
  })
  app.querySelectorAll('[data-group-step]').forEach((button) => {
    button.addEventListener('click', (event) => goToRelativeGroup(Number(event.currentTarget.dataset.groupStep)))
  })
  app.querySelectorAll('[data-participant]').forEach((input) => {
    input.addEventListener('input', (event) => updateParticipant(event.target.dataset.participant, event.target.value))
  })
  app.querySelectorAll('[data-bonus]').forEach((input) => {
    input.addEventListener('input', (event) => updateBonusAnswer(event.target.dataset.bonus, event.target.value))
  })
  app.querySelectorAll('[data-bonus-suggestion]').forEach((button) => {
    button.addEventListener('click', (event) => updateBonusAnswer(event.currentTarget.dataset.bonusSuggestion, event.currentTarget.dataset.suggestionValue))
  })
  app.querySelectorAll('[data-prediction]').forEach((input) => {
    input.addEventListener('input', (event) => updatePrediction(event.target.dataset.prediction, event.target.dataset.side, event.target.value))
  })
  app.querySelectorAll('[data-winner]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const match = bracket.find((candidate) => candidate.id === event.currentTarget.dataset.match)
      if (match) selectWinner(match, event.currentTarget.dataset.winner, bracket)
    })
  })
}

function renderGroupTabs() {
  return `
    <div class="group-tabs" aria-label="Velg gruppe">
      ${groupIds.map((group) => {
        const progress = getGroupProgress(group, state.predictions)
        const isActive = group === state.activeGroup
        return `
          <button class="${isActive ? 'active' : ''}" data-group="${group}" aria-pressed="${isActive}">
            <strong>${group}</strong>
            <span>${progress.completed}/${progress.total}</span>
          </button>
        `
      }).join('')}
    </div>
  `
}


function renderBonusQuestions(totalGroupGoals) {
  return `
    <div class="bonus-grid">
      <label class="bonus-result">
        <span>1. Du har tippet følgende totalt antall mål i gruppespillet</span>
        <strong>${totalGroupGoals}</strong>
      </label>
      ${bonusQuestions.map((question, index) => `
        <label class="bonus-question">
          <span>${index + 2}. ${escapeHtml(question.label)}</span>
          ${renderBonusInput(question)}
        </label>
      `).join('')}
    </div>
  `
}


function renderActiveGroup(table) {
  const currentIndex = groupIds.indexOf(state.activeGroup)
  return `
    <div class="active-group-layout">
      <article class="predict-card">
        <div class="card-heading">
          <div>
            <p class="eyebrow">Gruppe ${state.activeGroup}</p>
            <h3>Resultattips</h3>
          </div>
          <div class="group-nav">
            <button data-group-step="-1" ${currentIndex === 0 ? 'disabled' : ''}>Forrige</button>
            <button data-group-step="1" ${currentIndex === groupIds.length - 1 ? 'disabled' : ''}>Neste gruppe</button>
          </div>
        </div>
        <div class="matches featured-matches">
          ${groupMatches.filter((match) => match.group === state.activeGroup).map(renderMatchRow).join('')}
        </div>
      </article>

      <article class="table-card">
        <div class="card-heading">
          <div>
            <p class="eyebrow">Live tabell</p>
            <h3>Gruppe ${state.activeGroup}</h3>
          </div>
          <span class="legend"><i></i> videre · <i></i> mulig beste treer</span>
        </div>
        ${renderTable(table)}
      </article>
    </div>
  `
}


function renderTable(table) {
  return `
    <table>
      <thead>
        <tr><th>#</th><th>Lag</th><th>P</th><th>MF</th><th>M</th><th>Tie-break</th></tr>
      </thead>
      <tbody>
        ${table.map((row, index) => `
          <tr class="${index < 2 ? 'qualified' : index === 2 ? 'third' : ''}">
            <td>${index + 1}</td>
            <td>${escapeHtml(row.team.name)}</td>
            <td>${row.points}</td>
            <td>${row.goalDifference}</td>
            <td>${row.goalsFor}-${row.goalsAgainst}</td>
            <td>${escapeHtml(explainTieBreaker(row, table))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function renderMatchRow(match) {
  const prediction = state.predictions[match.id] ?? { home: '', away: '' }
  return `
    <div class="match-row">
      <div class="match-meta">
        <strong>${escapeHtml(match.date)} · ${escapeHtml(match.time)}</strong>
        <small>${escapeHtml(match.venue)}</small>
      </div>
      <span>${escapeHtml(displayName(match.home))}</span>
      <input aria-label="${escapeAttribute(displayName(match.home))} mål" inputmode="numeric" data-prediction="${match.id}" data-side="home" value="${escapeAttribute(prediction.home)}" />
      <span class="dash">–</span>
      <input aria-label="${escapeAttribute(displayName(match.away))} mål" inputmode="numeric" data-prediction="${match.id}" data-side="away" value="${escapeAttribute(prediction.away)}" />
      <span>${escapeHtml(displayName(match.away))}</span>
    </div>
  `
}

function renderRound(round, bracket) {
  return `
    <div class="round">
      <h3>${roundLabels[round]}</h3>
      ${bracket.filter((match) => match.round === round).map((match) => renderKnockoutMatch(match)).join('')}
    </div>
  `
}

function renderKnockoutMatch(match) {
  return `
    <article class="knockout-match">
      <small>${match.id}</small>
      ${[match.home, match.away].map((side) => renderKnockoutSide(match, side)).join('')}
    </article>
  `
}

function renderKnockoutSide(match, side) {
  const disabled = !side?.team
  const selected = side?.team?.id === state.knockoutWinners[match.id]
  return `
    <button
      class="${selected ? 'selected' : ''}"
      ${disabled ? 'disabled' : ''}
      ${side?.team ? `data-match="${match.id}" data-winner="${side.team.id}"` : ''}
    >
      <span>${escapeHtml(side?.team?.name ?? side?.source ?? 'Venter på vinner')}</span>
      <em>${escapeHtml(side?.source ?? '')}</em>
    </button>
  `
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;',
  })[character])
}

function escapeAttribute(value = '') {
  return escapeHtml(value)
}

function showStartupError(message) {
  const app = document.querySelector('#root')
  if (!app || app.children.length) return
  app.innerHTML = `
    <main>
      <section class="panel">
        <p class="eyebrow">Feil ved oppstart</p>
        <h1>Appen kunne ikke starte i denne nettleseren</h1>
        <p>Prøv å åpne <strong>vm-2026-tipping.html</strong> i Chrome, Edge, Firefox eller Safari etter at ZIP-filen er pakket ut.</p>
        <pre>${escapeHtml(message || 'Ukjent feil')}</pre>
      </section>
    </main>
  `
}

window.addEventListener('error', (event) => {
  showStartupError(event.message)
})

try {
  render()
} catch (error) {
  showStartupError(error.message)
}
})()
