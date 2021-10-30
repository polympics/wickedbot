const db = require('../db/index')
const { getTribe, getUser, getMapName } = require('../util/utils')

module.exports = {
  name: 'completed',
  description: 'completed sets',
  aliases: ['c', 'complete'],
  usage(prefix) {
    return `\`${prefix}complete [all OR player]\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {

    const setDesc = []

    const sql = 'SELECT * FROM set WHERE completed = true ORDER BY id'
    const resSets = await db.query(sql)
    let sets = resSets.rows

    const sqlusers = 'SELECT * FROM points LEFT JOIN set ON set_id = id WHERE completed = true ORDER BY set_id'
    const resPoints = await db.query(sqlusers)
    let points = resPoints.rows

    if (argsStr.includes('all')) {

      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      const completes = sets.filter(x => x.completed === true)

      if (sets.length === 0)
        return embed.setDescription('There are no incomplete sets anymore/yet')

      setDesc.push(`**Total sets: ${sets.length} sets,\nCompleted sets: ${completes.length}**`)

    } else {
      const mention = message.mentions.users.first()
      let user
      if (mention)
        user = getUser(message.guild, mention.username)
      else if (argsStr)
        user = getUser(message.guild, argsStr.toLowerCase())
      else
        user = getUser(message.guild, message.author.username)

      const userPoints = points.filter(x => x.player_id === user.id)
      sets = sets.filter(x => userPoints.some(y => y.set_id === x.id))
      points = points.filter(x => sets.some(y => y.id === x.set_id))

      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      if (sets.length === 0)
        return embed.setDescription((argsStr) ? `There are no completed games for ${user}` : 'You have no completed games')

      setDesc.push(`**All ${sets.length} completed games for ${user}**`)
    }
    setDesc.push('')

    sets.forEach(x => {
      const player1 = message.client.users.cache.get(x.player1)
      const player2 = message.client.users.cache.get(x.player2)

      const wickedServer = message.client.guilds.cache.get('433950651358380032')
      const emojiCache = wickedServer.emojis.cache

      const tribe1 = getTribe(x.tribes[0], emojiCache)
      const tribe2 = getTribe(x.tribes[1], emojiCache)
      // if()
      setDesc.push(`${x.id}: ${player1} (**@${player1.username ? player1.username : 'Player that left'}**) & ${player2} (**@${player2.username ? player2.username : 'Player that left'}**)`)
      setDesc.push(`${tribe1} & ${tribe2} (${getMapName(x.map_type)})`)
      setDesc.push('')
    })
    embed.setDescription(setDesc)

    return embed
  }
};