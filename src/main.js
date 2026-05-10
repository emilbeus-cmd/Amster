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

const initialState = {
  activeGroup: 'A',
  predictions: {},
  knockoutWinners: {},
  customTeamNames: Object.fromEntries(teams.map((team) => [team.id, team.name])),
  teamMeta: Object.fromEntries(teams.map((team) => [team.id, { conductScore: 0, fifaRank: 999 }])),
}

let state = loadState()

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeState({ ...initialState, ...JSON.parse(raw) }) : structuredClone(initialState)
  } catch {
    return structuredClone(initialState)
  }
}

function normalizeState(nextState) {
  return {
    ...nextState,
    activeGroup: groupIds.includes(nextState.activeGroup) ? nextState.activeGroup : 'A',
    customTeamNames: { ...initialState.customTeamNames, ...nextState.customTeamNames },
    teamMeta: { ...initialState.teamMeta, ...nextState.teamMeta },
  }
}

function persist(nextState) {
  state = normalizeState(nextState)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  render()
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
  })
}

function updateTeamName(teamId, value) {
  persist({
    ...state,
    customTeamNames: {
      ...state.customTeamNames,
      [teamId]: value,
    },
    knockoutWinners: {},
  })
}

function updateTeamMeta(teamId, field, value) {
  if (value !== '' && !/^-?\d{0,4}$/.test(value)) return
  persist({
    ...state,
    teamMeta: {
      ...state.teamMeta,
      [teamId]: {
        ...state.teamMeta[teamId],
        [field]: value === '' ? '' : Number(value),
      },
    },
    knockoutWinners: {},
  })
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
  persist(structuredClone(initialState))
}

function render() {
  const app = document.querySelector('#root')
  const tables = calculateTables(state.predictions, state.customTeamNames, state.teamMeta)
  const qualifiers = buildQualifiers(tables)
  const roundOf32 = buildRoundOf32(qualifiers)
  const bracket = buildKnockoutBracket(roundOf32, state.knockoutWinners)
  const completedGroupMatches = groupMatches.filter((match) => hasValidPrediction(state.predictions[match.id])).length
  const champion = bracket.find((match) => match.id === 'F-1')
  const championName = state.knockoutWinners['F-1'] ? displayName(state.knockoutWinners['F-1']) : 'Ikke kåret ennå'
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
          <li>Poeng i innbyrdes kamper mellom lag som står likt.</li>
          <li>Målforskjell i de innbyrdes kampene.</li>
          <li>Scorede mål i de innbyrdes kampene.</li>
          <li>Total målforskjell og deretter totalt scorede mål i gruppen.</li>
          <li>Valgfri fair play-score og FIFA-ranking kan fylles inn for å skille lag som fortsatt er like.</li>
        </ol>
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
  app.querySelectorAll('[data-team-input]').forEach((input) => {
    input.addEventListener('input', (event) => updateTeamName(event.target.dataset.teamInput, event.target.value))
  })
  app.querySelectorAll('[data-meta-field]').forEach((input) => {
    input.addEventListener('input', (event) => updateTeamMeta(event.target.dataset.teamId, event.target.dataset.metaField, event.target.value))
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

function renderActiveGroup(table) {
  const groupTeams = teams.filter((team) => team.group === state.activeGroup)
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

      <article class="team-settings-card">
        <div class="card-heading">
          <div>
            <p class="eyebrow">Lag og tie-break</p>
            <h3>Juster gruppe ${state.activeGroup}</h3>
          </div>
        </div>
        <div class="team-settings-grid">
          ${groupTeams.map(renderTeamSetting).join('')}
        </div>
      </article>
    </div>
  `
}

function renderTeamSetting(team) {
  const meta = state.teamMeta[team.id] ?? { conductScore: 0, fifaRank: 999 }
  return `
    <label class="team-setting">
      <span>${team.id}</span>
      <input data-team-input="${team.id}" value="${escapeAttribute(state.customTeamNames[team.id])}" aria-label="Navn for ${team.id}" />
      <input data-team-id="${team.id}" data-meta-field="conductScore" value="${escapeAttribute(meta.conductScore)}" aria-label="Fair play-score for ${team.id}" title="Fair play-score: høyere er bedre" />
      <input data-team-id="${team.id}" data-meta-field="fifaRank" value="${escapeAttribute(meta.fifaRank)}" aria-label="FIFA-ranking for ${team.id}" title="FIFA-ranking: lavere er bedre" />
    </label>
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

render()
