const db = require('../db/index')
const { getUserById } = require('../util/utils')

module.exports = {
  name: 'leaderboard',
  description: 'show leaderboard for players with 3 completed sets or more',
  aliases: ['lb'],
  usage(prefix) {
    return `\`${prefix}lb\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const sqlAgg = 'SELECT COUNT(id), SUM(points), SUM(malus) AS malus, player_id FROM set INNER JOIN points ON set_id = id WHERE completed = true GROUP BY player_id'
    const resAgg = await db.query(sqlAgg)
    const rowsAgg = resAgg.rows

    const sql = 'SELECT * FROM set WHERE completed = true ORDER BY id'
    const resSets = await db.query(sql)
    const sets = resSets.rows

    const sqlpoints = 'SELECT * FROM points LEFT JOIN set ON set_id = id WHERE completed = true ORDER BY set_id'
    const resPoints = await db.query(sqlpoints)
    const points = resPoints.rows

    rowsAgg.forEach(player => {
      const playerPoints = points.filter(x => x.player_id === player.player_id)
      const playerSets = sets.filter(x => playerPoints.some(y => y.set_id === x.id))
      const opponentsPoints = points.filter(x => playerSets.some(y => y.id === x.set_id && x.player_id !== player.player_id))

      player.wins = playerPoints.filter(x => x.result === 'win').length
      player.losses = playerPoints.filter(x => x.result === 'loss').length
      player.ties = playerPoints.filter(x => x.result === 'tie').length

      let sumOpponent = 0
      opponentsPoints.forEach(x => {
        sumOpponent = sumOpponent + x.points - x.malus
      })

      player.ratio = Number((((parseInt(player.sum) - parseInt(player.malus)) / sumOpponent) * (1.3 - 0.3 * Math.pow(0.85, (player.count - 3)))).toFixed(2))
    })

    function compare(a, b) {
      if (a.ratio < b.ratio)
        return 1;
      if (a.ratio > b.ratio)
        return -1;
      return 0;
    }
    rowsAgg.sort(compare)

    let index = 0
    rowsAgg.forEach(orderedPlayer => {
      const user = getUserById(message.guild, orderedPlayer.player_id)
      if (!user)
        return
      index = index + 1
      embed.addField(`${index}. **${user.username}**`, `(${orderedPlayer.wins}/${orderedPlayer.losses}/${orderedPlayer.ties}): **${orderedPlayer.ratio}**\n`)
    })

    embed.setTitle('Leaderboard')
    return embed
  }
};