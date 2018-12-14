const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login('NTIzMjY4NzkzNzM3MTUwNDc1.DvXDkw.OHN75OBkljEYbN88t72649IoMKA');
