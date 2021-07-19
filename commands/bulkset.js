const { MessageEmbed } = require('discord.js')
const newset = require('./newset')
const { getUser } = require('../util/utils')

module.exports = {
  name: 'bulkset',
  description: 'create multiple sets at once',
  aliases: ['bulk'],
  usage(prefix) {
    return `\`${prefix}bulkset gere sgt, front kitu,\` etc`
  },
  category: 'Staff',
  permsAllowed: ['MANAGE_GUILD', 'ADMINISTRATOR'],
  isSimple: false,
  execute: async function(message, argsStr) {
    if (!argsStr)
      throw 'You need to include the set players...'

    const args = argsStr.split(/ *, */).filter(x => x != '')
    if (args.length < 1)
      throw 'You need to provide at least 1 pair of players...'

    try {
      for (const group of args) {
        const otherEmbed = new MessageEmbed().setColor('#ED80A7')
        message.channel.send(await newset.execute(message, group, otherEmbed, true))
      }
    } catch (e) {
      throw e
    }


    const prePing = argsStr.split(/ *,? +/).filter(x => x != '')
    const toPing = []
    prePing.forEach(aPing => {
      const user = getUser(message.guild, aPing)
      if (!toPing.some(x => x === user))
        toPing.push(user)
    })

    return ['Here are your new sets:', toPing.join(', ')]
  }
};