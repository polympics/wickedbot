const db = require('../db/index')
const { getTribe } = require('../util/utils')
const set = require('./set')
const tribes = require('../util/tribes')

module.exports = {
  name: 'changetribes',
  description: 'change tribes for a game id',
  aliases: ['change', 'settribe'],
  usage(prefix) {
    return `\`${prefix}changetribes 25 QvO\``
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  execute: async function(message, argsStr, embed) {
    const args = argsStr.split(/ +/)
    if(args.length !== 2)
      throw `Make sure you have the set id and use the format TvT to set.\nLike this: ${this.usage(process.env.PREFIX)}`
    const setId = parseInt(args[0])
    const tribeKeys = args[1].split('v')

    const sql = 'SELECT * FROM test_set WHERE id = $1 AND completed = false'
    const values = [setId]
    const { rows } = await db.query(sql, values)
    if(rows.length < 1)
      throw 'Looks like you may be trying to change tribes for a completed, deleted or nonexistant game.\nYou should make sure you have the right id!'

    const emojiCache = message.guild.emojis.cache

    if(!tribes[tribeKeys[0].toUpperCase()] || !tribes[tribeKeys[1].toUpperCase()])
      throw `This server uses only ${getTribe('Z', emojiCache)}, ${getTribe('Y', emojiCache)}, ${getTribe('X', emojiCache)}, ${getTribe('Q', emojiCache)}, ${getTribe('O', emojiCache)}, ${getTribe('I', emojiCache)}, ${getTribe('H', emojiCache)} and ${getTribe('A', emojiCache)}`

    const tribe1 = getTribe(tribeKeys[0], emojiCache)
    const tribe2 = getTribe(tribeKeys[1], emojiCache)

    const sqlup = 'UPDATE test_set SET tribes = $1 WHERE id = $2'
    const valuesup = [[tribeKeys[0], tribeKeys[1]], setId]
    await db.query(sqlup, valuesup)

    message.channel.send(`New tribes for set ${args[0]}!\n${tribe1} vs ${tribe2}`)
    return set.execute(message, setId, embed)
  }
};