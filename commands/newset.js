const db = require('../db/index')
const { getUser, getTribe, getRandomTribes, getRandomMapTypeCode, getMapName } = require('../util/utils')


module.exports = {
  name: 'newset',
  description: 'create a set with random tribes',
  aliases: ['new'],
  usage(prefix) {
    return `\`${prefix}newset [player1] player2\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed, bulk) {
    const args = argsStr.split(/ +/)

    let player1
    let player2

    if (args.length === 1) {
      player1 = message.author
      if (message.mentions.users.size < 1)
        player2 = getUser(message.guild, args[0])
      else
        player2 = message.mentions.users.first()
    } else if (args.length === 2) {
      if (message.mentions.users.size < 1) {
        player1 = getUser(message.guild, args[0])
        player2 = getUser(message.guild, args[1])
      } else {
        player1 = message.mentions.users.first()
        player2 = message.mentions.users.last()
      }
    } else
      throw `This command needs one or two arguments: one player or two.\n\nLike this: ${this.usage(process.env.PREFIX)}`

    const tribeKeys = getRandomTribes(message.guild.emojis.cache)
    const mapTypeCode = getRandomMapTypeCode()

    const wickedServer = message.client.guilds.cache.get('433950651358380032')
    const emojiCache = wickedServer.emojis.cache

    const tribe1 = getTribe(tribeKeys[0], emojiCache)
    const tribe2 = getTribe(tribeKeys[1], emojiCache)

    try {
      const playerRole = message.guild.roles.cache.get(process.env.PLAYERROLEID)

      const member1 = message.guild.member(player1.id)
      const member2 = message.guild.member(player2.id)

      if (!member1 || !member2)
        throw 'There\'s a problem finding one of the players. Contact **jd (alphaSeahorse)** for support.'

      if ((!member1.roles.cache.has(playerRole.id) || !member2.roles.cache.has(playerRole.id))) {
        if (!member1.roles.cache.has(playerRole.id))
          throw `${player1} (${player1.username}) isn't signed up for **${playerRole.name}**.\nThey need to have the **${playerRole.name}** role to be in sets!`
        if (!member2.roles.cache.has(playerRole.id))
          throw `${player2} (${player2.username}) isn't signed up for **${playerRole.name}**.\nThey need to have the **${playerRole.name}** role to be in sets!`
      }

      const sql = 'INSERT INTO set (tribes, completed, map_type) VALUES ($1, false, $2) RETURNING id'
      const values = [[tribeKeys[0], tribeKeys[1]], mapTypeCode]

      const resSet = await db.query(sql, values)

      const sql1 = 'INSERT INTO points (set_id, player_id, points, bonus, malus) VALUES ($1, $2, 0, 0, 0)'
      const values1 = [resSet.rows[0].id, player1.id]

      await db.query(sql1, values1)

      const sql2 = 'INSERT INTO points (set_id, player_id, points, bonus, malus) VALUES ($1, $2, 0, 0, 0)'
      const values2 = [resSet.rows[0].id, player2.id]

      await db.query(sql2, values2)

      if (!bulk) {
        let setupText = ''
        if (player1 !== message.author)
          setupText = `, opposing ${player1} and ${player2}`

        message.channel.send(`New set created${setupText}\nID: ${resSet.rows[0].id}`)
      }

      embed.setTitle(`Set ID: ${resSet.rows[0].id}`)
        .addField('Players', `${player1}\n${player2}`)
        .addField('Map type', getMapName(mapTypeCode))
        .addField('Tribes:', `${tribe1} & ${tribe2}`)
      return embed
    } catch (error) {
      throw error
    }
  }
};