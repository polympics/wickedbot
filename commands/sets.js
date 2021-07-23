const db = require('../db/index')
const { getTribe, getUser } = require('../util/utils')

module.exports = {
  name: 'sets',
  description: 'all sets',
  aliases: [],
  usage(prefix) {
    return `\`${prefix}sets [all OR player]\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {

    const setDesc = []

    const sql = 'SELECT * FROM set ORDER BY id'
    const resSets = await db.query(sql)
    let sets = resSets.rows

    const sqlusers = 'SELECT * FROM points LEFT JOIN set ON set_id = id ORDER BY set_id'
    const resPoints = await db.query(sqlusers)
    let points = resPoints.rows

    if (argsStr.includes('all')) {
      if (sets.length === 0)
        return embed.setDescription('There are no sets yet')

      const incompletes = sets.filter(x => x.completed === false)
      const completes = sets.filter(x => x.completed === true)

      embed.setTitle(`There are ${incompletes.length + completes.length} total games.\n${incompletes.length} incompletes and ${completes.length} completed.`)
        .setDescription(`You can use \`${process.env.PREFIX}incomplete all\` and \`${process.env.PREFIX}completed all\` to see the sets' details!`)
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
      const incompletes = sets.filter(x => x.completed === false)
      const completes = sets.filter(x => x.completed === true)
      points = points.filter(x => sets.some(y => y.id === x.set_id))

      embed.setTitle(`There are ${sets.length} total games.\n${incompletes.length} incompletes and ${completes.length} completed.`)
      sets.forEach(set => {
        const setPoints = points.filter(x => x.set_id === set.id)
        set.player1 = setPoints[0].player_id
        set.player2 = setPoints[1].player_id
      })

      if (sets.length === 0)
        return embed.setTitle((argsStr) ? `There are no sets for ${user}` : 'You have no sets')

      setDesc.push(`**All sets for ${user}**`)
      setDesc.push('')
      sets.forEach(x => {
        const player1 = message.client.users.cache.get(x.player1)
        const player2 = message.client.users.cache.get(x.player2)

        const wickedServer = message.client.guilds.cache.get('433950651358380032')
        const emojiCache = wickedServer.emojis.cache

        const tribe1 = getTribe(x.tribes[0], emojiCache)
        const tribe2 = getTribe(x.tribes[1], emojiCache)
        setDesc.push(`${x.id}: ${player1} (**@${player1.username}**) & ${player2} (**@${player2.username}**)`)
        setDesc.push(`${tribe1} & ${tribe2}`)
        setDesc.push('')
      })

      embed.setDescription(setDesc)
    }

    return embed
  }
};