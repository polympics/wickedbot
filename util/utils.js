const tribes = require('./tribes')
const maps = require('./maps')

module.exports.getUserById = function(guild, id) {
  const user = guild.members.cache.filter(x => x.user.id === id)

  if (user.first())
    return user.first().user
}

module.exports.getUser = function(guild, name) {
  const members = guild.members.cache.filter(x => {
    let found

    if (x.nickname) {
      found = x.nickname.toLowerCase().includes(name.toLowerCase()) || x.user.username.toLowerCase().includes(name.toLowerCase())
    } else {
      found = x.user.username.toLowerCase().includes(name.toLowerCase()) || name.includes(x.id)
    }

    return found
  })

  if (members.size === 0)
    throw `There is no players matching **${name}**... ¯\\_(ツ)_/¯`
  if (members.size > 1)
    throw `There's more than one player matching **${name}**`
  return members.first().user
}

module.exports.getMapName = function(mapCode) {
  if (!mapCode)
    return 'None set'

  const map = maps.filter(x => x.code === mapCode.toLowerCase())[0]

  return map.name
}

module.exports.getRandomMapTypeCode = function() {
  const randomMap = maps[Math.floor(Math.random() * maps.length)]

  return randomMap.code
}

module.exports.getTribe = function(tribeCode, emojis) {
  const tribe = tribes[tribeCode.toUpperCase()]

  const tribeEmoji = emojis.filter(x => x.name === tribe.emoji)

  return tribeEmoji.first()
}

module.exports.getRandomTribes = function() {
  const randomKey = function(obj) {
    const keys = Object.keys(obj);
    const key = keys[keys.length * Math.random() << 0]
    return key;
  };

  const randomTribeKey1 = randomKey(tribes)
  let randomTribeKey2
  do {
    randomTribeKey2 = randomKey(tribes)
  } while (randomTribeKey1 === randomTribeKey2)

  return [randomTribeKey1, randomTribeKey2]
}

module.exports.getWinner = function(player1, player2) {
  if (player1.pointsWithMalus > player2.pointsWithMalus) {
    player1.result = 'win'
    player2.result = 'loss'
  } else if (player1.pointsWithMalus < player2.pointsWithMalus) {
    player1.result = 'loss'
    player2.result = 'win'
  } else {
    player1.result = 'tie'
    player2.result = 'tie'
  }
}