const roundLabels = {
  round32: '1/16-finaler',
  round16: '1/8-finaler',
  quarter: 'Kvartfinaler',
  semi: 'Semifinaler',
  final: 'Finale',
}

const groupIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

const groupTeamNames = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curaçao', "Côte d'Ivoire", 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'IR Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
}

const teams = groupIds.flatMap((group) =>
  groupTeamNames[group].map((name, index) => ({
    id: `${group}${index + 1}`,
    name,
    group,
  })),
)

const teamById = new Map(teams.map((team) => [team.id, team]))

const matchScheduleByGroup = {
  A: [
    ['A1', 'A2', '11. juni 2026', '21:00 norsk tid', 'Estadio Azteca, Mexico City'],
    ['A3', 'A4', '12. juni 2026', '04:00 norsk tid', 'Estadio Akron, Guadalajara'],
    ['A2', 'A4', '18. juni 2026', '18:00 norsk tid', 'Mercedes-Benz Stadium, Atlanta'],
    ['A1', 'A3', '19. juni 2026', '03:00 norsk tid', 'Estadio Akron, Guadalajara'],
    ['A1', 'A4', '25. juni 2026', '03:00 norsk tid', 'Estadio Azteca, Mexico City'],
    ['A3', 'A2', '25. juni 2026', '03:00 norsk tid', 'Estadio BBVA, Monterrey'],
  ],
  B: [
    ['B1', 'B2', '12. juni 2026', '21:00 norsk tid', 'BMO Field, Toronto'],
    ['B3', 'B4', '13. juni 2026', '21:00 norsk tid', "Levi's Stadium, Santa Clara"],
    ['B4', 'B2', '18. juni 2026', '21:00 norsk tid', 'SoFi Stadium, Inglewood'],
    ['B1', 'B3', '19. juni 2026', '00:00 norsk tid (natt til 19. juni)', 'BC Place, Vancouver'],
    ['B1', 'B4', '24. juni 2026', '21:00 norsk tid', 'BC Place, Vancouver'],
    ['B3', 'B2', '24. juni 2026', '21:00 norsk tid', 'Lumen Field, Seattle'],
  ],
  C: [
    ['C1', 'C2', '14. juni 2026', '00:00 norsk tid (natt til 14. juni)', 'MetLife Stadium, East Rutherford'],
    ['C3', 'C4', '14. juni 2026', '03:00 norsk tid', 'Gillette Stadium, Foxborough'],
    ['C4', 'C2', '19. juni 2026', '21:00 norsk tid', 'Gillette Stadium, Foxborough'],
    ['C1', 'C3', '20. juni 2026', '03:00 norsk tid', 'Lincoln Financial Field, Philadelphia'],
    ['C4', 'C1', '25. juni 2026', '00:00 norsk tid (natt til 25. juni)', 'Hard Rock Stadium, Miami Gardens'],
    ['C2', 'C3', '25. juni 2026', '00:00 norsk tid (natt til 25. juni)', 'Mercedes-Benz Stadium, Atlanta'],
  ],
  D: [
    ['D1', 'D2', '13. juni 2026', '03:00 norsk tid', 'SoFi Stadium, Inglewood'],
    ['D3', 'D4', '13. juni 2026', '06:00 norsk tid', 'BC Place, Vancouver'],
    ['D2', 'D4', '19. juni 2026', '06:00 norsk tid', "Levi's Stadium, Santa Clara"],
    ['D1', 'D3', '19. juni 2026', '21:00 norsk tid', 'Lumen Field, Seattle'],
    ['D1', 'D4', '26. juni 2026', '04:00 norsk tid', 'SoFi Stadium, Inglewood'],
    ['D2', 'D3', '26. juni 2026', '04:00 norsk tid', "Levi's Stadium, Santa Clara"],
  ],
  E: [
    ['E1', 'E2', '14. juni 2026', '19:00 norsk tid', 'NRG Stadium, Houston'],
    ['E3', 'E4', '15. juni 2026', '01:00 norsk tid', 'Lincoln Financial Field, Philadelphia'],
    ['E1', 'E3', '20. juni 2026', '22:00 norsk tid', 'BMO Field, Toronto'],
    ['E4', 'E2', '21. juni 2026', '02:00 norsk tid', 'GEHA Field at Arrowhead, Kansas City'],
    ['E4', 'E1', '25. juni 2026', '22:00 norsk tid', 'MetLife Stadium, East Rutherford'],
    ['E2', 'E3', '25. juni 2026', '22:00 norsk tid', 'Lincoln Financial Field, Philadelphia'],
  ],
  F: [
    ['F1', 'F2', '14. juni 2026', '22:00 norsk tid', 'AT&T Stadium, Arlington'],
    ['F4', 'F3', '15. juni 2026', '04:00 norsk tid', 'Estadio BBVA, Monterrey'],
    ['F4', 'F2', '20. juni 2026', '06:00 norsk tid', 'Estadio BBVA, Monterrey'],
    ['F1', 'F3', '20. juni 2026', '19:00 norsk tid', 'NRG Stadium, Houston'],
    ['F4', 'F1', '26. juni 2026', '01:00 norsk tid', 'GEHA Field at Arrowhead, Kansas City'],
    ['F2', 'F3', '26. juni 2026', '01:00 norsk tid', 'AT&T Stadium, Arlington'],
  ],
  G: [
    ['G1', 'G2', '15. juni 2026', '21:00 norsk tid', 'Lumen Field, Seattle'],
    ['G3', 'G4', '16. juni 2026', '03:00 norsk tid', 'SoFi Stadium, Inglewood'],
    ['G1', 'G3', '21. juni 2026', '21:00 norsk tid', 'SoFi Stadium, Inglewood'],
    ['G4', 'G2', '22. juni 2026', '03:00 norsk tid', 'BC Place, Vancouver'],
    ['G4', 'G1', '27. juni 2026', '05:00 norsk tid', 'BC Place, Vancouver'],
    ['G2', 'G3', '27. juni 2026', '05:00 norsk tid', 'Lumen Field, Seattle'],
  ],
  H: [
    ['H1', 'H2', '15. juni 2026', '18:00 norsk tid', 'Mercedes-Benz Stadium, Atlanta'],
    ['H3', 'H4', '16. juni 2026', '00:00 norsk tid (natt til 16. juni)', 'Hard Rock Stadium, Miami Gardens'],
    ['H1', 'H3', '21. juni 2026', '18:00 norsk tid', 'Mercedes-Benz Stadium, Atlanta'],
    ['H4', 'H2', '22. juni 2026', '00:00 norsk tid (natt til 22. juni)', 'Hard Rock Stadium, Miami Gardens'],
    ['H4', 'H1', '27. juni 2026', '02:00 norsk tid', 'Estadio Akron, Guadalajara'],
    ['H2', 'H3', '27. juni 2026', '02:00 norsk tid', 'NRG Stadium, Houston'],
  ],
  I: [
    ['I1', 'I2', '16. juni 2026', '21:00 norsk tid', 'MetLife Stadium, East Rutherford'],
    ['I4', 'I3', '17. juni 2026', '00:00 norsk tid (natt til 17. juni)', 'Gillette Stadium, Foxborough'],
    ['I1', 'I3', '22. juni 2026', '23:00 norsk tid', 'Lincoln Financial Field, Philadelphia'],
    ['I4', 'I2', '23. juni 2026', '02:00 norsk tid', 'MetLife Stadium, East Rutherford'],
    ['I4', 'I1', '26. juni 2026', '21:00 norsk tid', 'Gillette Stadium, Foxborough'],
    ['I2', 'I3', '26. juni 2026', '21:00 norsk tid', 'BMO Field, Toronto'],
  ],
  J: [
    ['J3', 'J4', '16. juni 2026', '06:00 norsk tid', "Levi's Stadium, Santa Clara"],
    ['J1', 'J2', '17. juni 2026', '03:00 norsk tid', 'GEHA Field at Arrowhead, Kansas City'],
    ['J1', 'J3', '22. juni 2026', '19:00 norsk tid', 'AT&T Stadium, Arlington'],
    ['J4', 'J2', '23. juni 2026', '05:00 norsk tid', "Levi's Stadium, Santa Clara"],
    ['J4', 'J1', '28. juni 2026', '04:00 norsk tid', 'AT&T Stadium, Arlington'],
    ['J2', 'J3', '28. juni 2026', '04:00 norsk tid', 'GEHA Field at Arrowhead, Kansas City'],
  ],
  K: [
    ['K1', 'K2', '17. juni 2026', '19:00 norsk tid', 'NRG Stadium, Houston'],
    ['K3', 'K4', '18. juni 2026', '04:00 norsk tid', 'Estadio Azteca, Mexico City'],
    ['K1', 'K3', '23. juni 2026', '19:00 norsk tid', 'NRG Stadium, Houston'],
    ['K4', 'K2', '24. juni 2026', '04:00 norsk tid', 'Estadio Akron, Guadalajara'],
    ['K4', 'K1', '28. juni 2026', '01:30 norsk tid', 'Hard Rock Stadium, Miami Gardens'],
    ['K3', 'K2', '28. juni 2026', '01:30 norsk tid', 'Mercedes-Benz Stadium, Atlanta'],
  ],
  L: [
    ['L1', 'L2', '17. juni 2026', '22:00 norsk tid', 'AT&T Stadium, Arlington'],
    ['L3', 'L4', '18. juni 2026', '01:00 norsk tid', 'BMO Field, Toronto'],
    ['L1', 'L3', '23. juni 2026', '22:00 norsk tid', 'Gillette Stadium, Foxborough'],
    ['L4', 'L2', '24. juni 2026', '01:00 norsk tid', 'BMO Field, Toronto'],
    ['L4', 'L1', '27. juni 2026', '23:00 norsk tid', 'MetLife Stadium, East Rutherford'],
    ['L2', 'L3', '27. juni 2026', '23:00 norsk tid', 'Lincoln Financial Field, Philadelphia'],
  ],
}

const groupMatches = groupIds.flatMap((group) =>
  matchScheduleByGroup[group].map(([home, away, date, time, venue], matchIndex) => ({
    id: `${group}-${matchIndex + 1}`,
    group,
    home,
    away,
    date,
    time,
    venue,
  })),
)

const emptyRow = (team) => ({
  team,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  headToHeadNote: '',
})

const parseScore = (value) => {
  if ((value ?? '').trim() === '') return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return null
  return parsed
}

function hasValidPrediction(prediction) {
  return Boolean(prediction && parseScore(prediction.home) !== null && parseScore(prediction.away) !== null)
}

function compareRows(a, b) {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1

  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.team.name.localeCompare(b.team.name, 'nb')
  )
}

function calculateTables(predictions, teamNames = {}) {
  return Object.fromEntries(
    groupIds.map((group) => {
      const rows = new Map(
        teams
          .filter((team) => team.group === group)
          .map((team) => [team.id, emptyRow({ ...team, name: teamNames[team.id] || team.name })]),
      )
      const matches = groupMatches.filter((match) => match.group === group)

      matches.forEach((match) => {
        const prediction = predictions[match.id]
        const homeGoals = parseScore(prediction?.home ?? '')
        const awayGoals = parseScore(prediction?.away ?? '')

        if (homeGoals === null || awayGoals === null) return

        const homeRow = rows.get(match.home)
        const awayRow = rows.get(match.away)
        if (!homeRow || !awayRow) return

        applyResult(homeRow, awayRow, homeGoals, awayGoals)
      })

      return [group, sortGroupRows([...rows.values()], matches, predictions)]
    }),
  )
}

function getGroupProgress(group, predictions) {
  const matches = groupMatches.filter((match) => match.group === group)
  return {
    completed: matches.filter((match) => hasValidPrediction(predictions[match.id])).length,
    total: matches.length,
  }
}

function explainTieBreaker(row, table) {
  const tiedOnPoints = table.filter((candidate) => candidate.points === row.points)
  if (tiedOnPoints.length === 1) return 'Ikke poenglikhet'
  return row.headToHeadNote || 'Sortert på total målforskjell og scorede mål'
}

function applyResult(homeRow, awayRow, homeGoals, awayGoals) {
  homeRow.played += 1
  awayRow.played += 1
  homeRow.goalsFor += homeGoals
  homeRow.goalsAgainst += awayGoals
  awayRow.goalsFor += awayGoals
  awayRow.goalsAgainst += homeGoals

  if (homeGoals > awayGoals) {
    homeRow.won += 1
    awayRow.lost += 1
    homeRow.points += 3
  } else if (homeGoals < awayGoals) {
    awayRow.won += 1
    homeRow.lost += 1
    awayRow.points += 3
  } else {
    homeRow.drawn += 1
    awayRow.drawn += 1
    homeRow.points += 1
    awayRow.points += 1
  }

  homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst
  awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst
}

function sortGroupRows(rows, matches, predictions) {
  const sorted = rows.sort(compareRows)
  const result = []

  for (let index = 0; index < sorted.length;) {
    const tiedRows = [sorted[index]]
    index += 1

    while (index < sorted.length && hasSamePrimaryTie(sorted[index], tiedRows[0])) {
      tiedRows.push(sorted[index])
      index += 1
    }

    result.push(...sortPointTie(tiedRows, matches, predictions))
  }

  return result
}

function hasSamePrimaryTie(a, b) {
  return a.points === b.points && a.goalDifference === b.goalDifference && a.goalsFor === b.goalsFor
}

function sortPointTie(rows, matches, predictions) {
  if (rows.length <= 1) return rows

  const concernedIds = new Set(rows.map((row) => row.team.id))
  const headToHead = new Map(rows.map((row) => [row.team.id, emptyRow(row.team)]))

  matches.forEach((match) => {
    if (!concernedIds.has(match.home) || !concernedIds.has(match.away)) return
    const prediction = predictions[match.id]
    const homeGoals = parseScore(prediction?.home ?? '')
    const awayGoals = parseScore(prediction?.away ?? '')
    if (homeGoals === null || awayGoals === null) return
    applyResult(headToHead.get(match.home), headToHead.get(match.away), homeGoals, awayGoals)
  })

  const h2hLabel = rows.length === 2 ? 'Innbyrdes oppgjør' : `Innbyrdes tabell mellom ${rows.length} lag`

  return rows.sort((a, b) => {
    const h2hA = headToHead.get(a.team.id)
    const h2hB = headToHead.get(b.team.id)
    const h2hResult = compareHeadToHeadRows(h2hA, h2hB)
    if (h2hResult !== 0) {
      a.headToHeadNote = h2hLabel
      b.headToHeadNote = h2hLabel
      return h2hResult
    }

    a.headToHeadNote = 'Innbyrdes likt – fair play er ignorert'
    b.headToHeadNote = 'Innbyrdes likt – fair play er ignorert'
    return a.team.name.localeCompare(b.team.name, 'nb')
  })
}

function compareHeadToHeadRows(a, b) {
  return b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
}

function buildQualifiers(tables) {
  const firstAndSecond = groupIds.flatMap((group) => [
    {
      seed: `${group}1`,
      source: `Vinner gruppe ${group}`,
      team: tables[group][0]?.team ?? null,
      stats: tables[group][0],
    },
    {
      seed: `${group}2`,
      source: `Toer gruppe ${group}`,
      team: tables[group][1]?.team ?? null,
      stats: tables[group][1],
    },
  ])

  const thirdPlaced = groupIds
    .map((group) => ({
      seed: `${group}3`,
      source: `Treer gruppe ${group}`,
      team: tables[group][2]?.team ?? null,
      stats: tables[group][2],
    }))
    .sort((a, b) => compareRows(a.stats, b.stats))
    .slice(0, 8)
    .map((qualifier, index) => ({
      ...qualifier,
      seed: `B3-${index + 1}`,
      source: `${index + 1}. beste gruppetreer (${qualifier.source})`,
    }))

  return [...firstAndSecond, ...thirdPlaced]
}

function buildRoundOf32(qualifiers) {
  const bySeed = new Map(qualifiers.map((qualifier) => [qualifier.seed, qualifier]))
  const winners = groupIds.map((group) => bySeed.get(`${group}1`) ?? placeholder(`Vinner gruppe ${group}`))
  const runnersUp = groupIds.map((group) => bySeed.get(`${group}2`) ?? placeholder(`Toer gruppe ${group}`))
  const thirds = Array.from({ length: 8 }, (_, index) => bySeed.get(`B3-${index + 1}`) ?? placeholder(`${index + 1}. beste gruppetreer`))

  const topWinnerMatches = winners.slice(0, 8).map((winner, index) => [winner, thirds[index]])
  const remainingMatches = [
    [winners[8], runnersUp[0]],
    [winners[9], runnersUp[1]],
    [winners[10], runnersUp[2]],
    [winners[11], runnersUp[3]],
    [runnersUp[4], runnersUp[5]],
    [runnersUp[6], runnersUp[7]],
    [runnersUp[8], runnersUp[9]],
    [runnersUp[10], runnersUp[11]],
  ]

  return [...topWinnerMatches, ...remainingMatches].map(([home, away], index) => ({
    id: `R32-${index + 1}`,
    round: 'round32',
    home,
    away,
  }))
}

function buildKnockoutBracket(roundOf32, winners) {
  const matches = [...roundOf32]
  const addRound = (round, prefix, previousIds) => {
    const nextIds = []
    for (let index = 0; index < previousIds.length; index += 2) {
      const first = previousIds[index]
      const second = previousIds[index + 1]
      const id = `${prefix}-${index / 2 + 1}`
      matches.push({
        id,
        round,
        home: winnerAsQualifier(matches.find((match) => match.id === first), winners[first]),
        away: winnerAsQualifier(matches.find((match) => match.id === second), winners[second]),
        dependsOn: [first, second],
      })
      nextIds.push(id)
    }
    return nextIds
  }

  const round16 = addRound('round16', 'R16', roundOf32.map((match) => match.id))
  const quarters = addRound('quarter', 'QF', round16)
  const semis = addRound('semi', 'SF', quarters)
  addRound('final', 'F', semis)

  return matches
}

function winnerAsQualifier(match, winnerId) {
  const team = [match?.home, match?.away].find((side) => side?.team?.id === winnerId)
  return team ?? placeholder(match ? `Vinner ${match.id}` : 'Vinner kamp')
}

function placeholder(source) {
  return {
    seed: source,
    source,
    team: null,
  }
}


window.Tournament = {
  buildKnockoutBracket,
  buildQualifiers,
  buildRoundOf32,
  calculateTables,
  compareRows,
  explainTieBreaker,
  getGroupProgress,
  groupIds,
  groupMatches,
  hasValidPrediction,
  roundLabels,
  teamById,
  teams,
}
