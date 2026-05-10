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

const groupMatches = groupIds.flatMap((group) => {
  const groupTeams = teams.filter((team) => team.group === group)
  const pairings = [
    [0, 1],
    [2, 3],
    [0, 2],
    [1, 3],
    [0, 3],
    [1, 2],
  ]

  return pairings.map(([homeIndex, awayIndex], matchIndex) => ({
    id: `${group}-${matchIndex + 1}`,
    group,
    home: groupTeams[homeIndex].id,
    away: groupTeams[awayIndex].id,
  }))
})

const emptyRow = (team, meta) => ({
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
  conductScore: Number(meta?.conductScore === '' ? 0 : (meta?.conductScore ?? 0)),
  fifaRank: Number(meta?.fifaRank === '' ? 999 : (meta?.fifaRank ?? 999)),
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
    b.conductScore - a.conductScore ||
    a.fifaRank - b.fifaRank ||
    a.team.name.localeCompare(b.team.name, 'nb')
  )
}

function calculateTables(predictions, teamNames = {}, teamMeta = {}) {
  return Object.fromEntries(
    groupIds.map((group) => {
      const rows = new Map(
        teams
          .filter((team) => team.group === group)
          .map((team) => [
            team.id,
            emptyRow({ ...team, name: teamNames[team.id] || team.name }, teamMeta[team.id]),
          ]),
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
  return row.headToHeadNote || 'Sortert på total målforskjell, scorede mål, fair play og FIFA-ranking'
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
  const byPoints = rows.reduce((groups, row) => {
    const pointRows = groups.get(row.points) ?? []
    pointRows.push(row)
    groups.set(row.points, pointRows)
    return groups
  }, new Map())
  return [...byPoints.keys()]
    .sort((a, b) => b - a)
    .flatMap((points) => sortPointTie(byPoints.get(points), matches, predictions))
}

function sortPointTie(rows, matches, predictions) {
  if (rows.length <= 1) return rows

  const concernedIds = new Set(rows.map((row) => row.team.id))
  const headToHead = new Map(rows.map((row) => [row.team.id, emptyRow(row.team, row)]))

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

    a.headToHeadNote = 'Innbyrdes likt – bruker totalstatistikk'
    b.headToHeadNote = 'Innbyrdes likt – bruker totalstatistikk'
    return compareRows(a, b)
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
