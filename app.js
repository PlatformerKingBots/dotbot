//https://discordapp.com/oauth2/authorize?client_id=448883231400656898&scope=bot&permissions=2146958591
const Discord = require('discord.js');
const request = require('request');
const wordscramble = require('wordscramble');
const randomWords = require('random-words');
const lolcat = require('lolspeak');
const randomColor = require('randomcolor');
const cloudinary = require('cloudinary');
const qr = require('qr-image');
const doge = require('doge');
const fs = require("fs");
const client = new Discord.Client();
const embedColor = 0xe74c3c;
const embedColor2 = 0x2ecc71;
const prefix = '.';
const emojis = {
  success: '<:success:487316006843449354>',
  error: '<:error:487316007040581632>',
  coin: '<:coin:448929927329349643>',
  cash: '<:cash:448929927748911120>',
  online: '<:online:449318408883011594>',
  idle: '<:idle:449318408756920331>>',
  dnd: '<:dnd:449318408593473536>',
  offline: '<:offline:449318409356836874>',
  t: '🇹',
  f: '🇫',
};

cloudinary.config({
  cloud_name: 'sample',
  api_key: '853137161879979',
  api_secret: 'iTqHg5xEKg0dBY7UaNjmmo7vE1A'
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("for .help", {type: "WATCHING"});
});

const categoryDescriptions = {
  'General': 'Random commands such as help and serverinfo',
  'Moderator': 'Moderation commands to help you with your server',
  'Fun': 'Super pointless stuff'
};
let ca;
let channelArr;

var triviaTime = new Date(-5000);
var trivia = {
  on: false,
};

var scramble = {};

var cap = function(word) {
  return word.slice(0, 1).toUpperCase() + word.slice(1, word.length).toLowerCase();
};
var format = function(t) {
  let one = t.split('&quot;').join('\\"');
  return one.split('&#039;').join('\\\'');
};

/*
'cmd': {
      description: 'description',
      usage: `${prefix}cmd [required] {optional}`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        
      },
    },
*/

const commands = {
  'General': {
    'help': {
      description: 'Displays list of commands',
      usage: `${prefix}help {command/category}`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        let cats = [];
        for (let i in commands) {
          if (!commands[i].showHelp && i != 'eval') {
          cats.push({ name: i, value: categoryDescriptions[i] + '.' });
          }
        }
        if (period[1]) {

        }
        else {}
        if (!period[1]) {
          message.channel.send({
            embed: {
              color: embedColor,
              title: 'DotBot Help',
              description: `Use \`${prefix}help.[category]\` to see the commands in each category.` /*`, or \`${prefix}help.all\` to see them all.`*/ ,
              fields: cats,
              footer: {
                icon_url: message.author.avatarURL,
                text: "Requested by " + message.author.tag
              },
            }
          });
        }
        else if (commands[period[1].slice(0, 1).toUpperCase() + period[1].slice(1, period[1].length)]) {
          let com = [];
          let ca = period[1].slice(0, 1).toUpperCase() + period[1].slice(1, period[1].length);
          let c = commands[ca];
          for (let i in c) {
            if (!commands[i].showHelp) {
              com.push({ name: prefix + i, value: c[i].description });
            }
          }
          message.channel.send({
            embed: {
              color: embedColor,
              title: 'DotBot Help: ' + ca,
              description: categoryDescriptions[ca],
              fields: com,
              timestamp: new Date(),
              footer: {
                icon_url: message.author.avatarURL,
                text: "Requested by " + message.author.tag
              },
            }
          });
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, I can't find that category.`);
        }
      },
    },
    'serverinfo': {
      description: 'Displays info about the server',
      usage: `${prefix}serverinfo`,
      runIf: null,
      dm: false,
      run: function(message, args, period) {
        try {
          var emojis = message.guild.emojis.map(r => r.toString()).join("  ");
          message.channel.send({
            embed: {
              title: `${message.guild.name} Info`,
              thumbnail: {
                url: message.guild.iconURL,
              },
              color: embedColor,
              fields: [
                { name: `Name`, value: message.guild.name, inline: true },
                { name: `ID`, value: message.guild.id, inline: true },
                { name: `Owner`, value: `<@${message.guild.ownerID}>`, inline: true },
                { name: `Emojis`, value: (emojis ? emojis : 'None'), inline: true },
                { name: `Members`, value: message.guild.memberCount, inline: true },
              ],
            }
          });
        }
        catch (e) {
          console.log(e);
        }
      },
    },
    'membercount': {
      description: 'Displays info about the server',
      usage: `${prefix}memberCount`,
      runIf: null,
      dm: false,
      run: function(message, args, period) {
        let bots = message.guild.members.filter(member => member.user.bot).size;
        let online = message.guild.members.filter(member => member.user.presence.status !== 'offline').size;
        message.channel.send({
          embed: {
            title: `${message.guild.name} Members`,
            color: embedColor,
            fields: [
              { name: `Total`, value: message.guild.memberCount, inline: true },
              { name: `Humans`, value: message.guild.memberCount - bots, inline: true },
              { name: `Bots`, value: bots, inline: true },
              { name: `Online`, value: online, inline: true },
            ],
          }
        });
      },
    },
    'userinfo': {
      description: 'Displays info about a user',
      usage: `${prefix}userinfo {@user}`,
      runIf: null,
      dm: false,
      run: function(message, args, period) {
        let member = message.member;
        if (!args[0]) {
          member = message.member;
        }
        else {
          if (message.mentions.members.first()) {
            member = message.mentions.members.first();
          }
          else if (message.guild.members.get(args[0])) {
            member = message.guild.members.get(args[0]);
          }
          else if (message.guild.members.find("username", args[0])) {
            member = message.guild.members.find("username", args[0]);
          }
          else {
            member = message.member;
          }
        }
        try {
          let createdAt;
          let game;
          if (member.lastMessage) {
            createdAt = member.lastMessage.createdAt;
          }
          else {
            createdAt = 'Unknown';
          }
          if (member.presence.game) {
            game = member.presence.game.name;
          }
          else {
            game = 'None';
          }
          let roles0 = member.roles.map(r => r.toString());
          let rolesPoint5 = ((roles0.length > 10) ? (' and ' + (roles0.length - 10) + ' more') : '');
          let roles1 = roles0.splice(0, 10).join(' ') + rolesPoint5;
          message.channel.send({
            embed: {
              title: `${member.user.username} Info`,
              thumbnail: {
                url: member.user.avatarURL,
              },
              color: parseInt(member.displayColor, 0),
              fields: [
                { name: `Tag`, value: member.user.tag, inline: true },
                { name: `Nickname`, value: 'Nick: ' + (member.nickname ? member.nickname : 'None'), inline: true },
                { name: `Status`, value: emojis[member.presence.status] + member.presence.status, inline: true },
                { name: `Game`, value: game, inline: true },
                { name: `ID`, value: member.id, inline: true },
                { name: `Server Member Since`, value: member.joinedAt, inline: true },
                { name: `Last Active`, value: createdAt, inline: true },
                { name: `Roles`, value: roles1, inline: true },
              ],
            }
          });
        }
        catch (e) {
          console.log(e);
        }
      },
    },
    'emojiinfo': {
      description: 'Displays information about an emoji',
      usage: `${prefix}emojiinfo [emoji]`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        let emojisa = message.guild.emojis.array();
        let emoji = null;
        for (var i = 0; i < emojisa.length; i++) {
          if (emojisa[i].name === args[0] || ':' + [i].name + ':' === args[0] || '<:' + emojisa[i].name + ':' + emojisa[i].id + '>' === args[0]) {
            emoji = emojisa[i];
            break;
          }
        }

        if (emoji) {
          let nm = emoji.name.slice(0, 1).toUpperCase() + emoji.name.slice(1, emoji.name.length).toLowerCase();
          message.channel.send({
            embed: {
              title: nm + ' Emoji Info',
              color: embedColor,
              thumbnail: {
                url: emoji.url,
              },
              fields: [
                { name: `Name`, value: emoji.name, inline: true },
                { name: `ID`, value: emoji.id, inline: true },
                { name: `URL`, value: emoji.url, inline: true },
                { name: `Animated`, value: emoji.animated ? 'Yes' : 'No', inline: true },
                { name: `Created`, value: emoji.createdAt, inline: true },
              ],
            }
          });
        }
        else {
          message.channel.send(`${emojis.error} I couldn't find that emoji.`);
        }
      },
    },
    'eval': {
      description: 'eval',
      usage: `${prefix}eval [stuff]`,
      runIf: null,
      dm: true,
      showHelp: true,
      run: function(message, args, period) {
        if (message.author.id == '270997352939126794') {
          try {
          const code = args.join(" ");
          let evaled = eval(code);
    
          if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);
    
          message.channel.send(clean(evaled), {code:"xl"});
        } catch (err) {
          message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
        }
      },
    },
  },
  'Moderator': {
    'ban': {
      description: 'Bans a user from your server',
      usage: `${prefix}ban [@user] {reason}`,
      runIf: function(message, args, period) {
        return message.member.hasPermission('BAN_MEMBERS');
      },
      dm: false,
      run: function(message, args, period) {
        let member = message.mentions.members.first();
        let reason = (args[1]) ? args[1] : 'No reason provided';
        if (member) {
          if (member.id === message.author.id) {
            message.channel.send(`${emojis.error} ${message.member}, you can't ban yourself!`);
          }
          else if (member.id === client.user.id) {
            message.channel.send(`${emojis.error} ${message.member}, I can't ban myself!`);
          }
          else {
            try {
              member.ban({ days: 7, reason: reason });
              message.channel.send(`${emojis.success} Member successfully banned!`);
            }
            catch (e) {
              message.channel.send(`${emojis.error} There was some kind of error. We're looking into it.`);
              message.client.channels.get('449178631462322187').send({
                embed: {
                  title: 'Error',
                  fields: [
                    { name: `Command`, value: `Ban`, inline: true },
                    { name: `User Tag`, value: message.author.tag, inline: true },
                    { name: `User ID`, value: message.author.id, inline: true },
                    { name: `Error`, value: e, inline: true },
                    { name: `Guild`, value: message.guild.name + ', #' + message.channel.name, inline: true },
                  ],
                }
              });
            }
          }
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, you must provide a user. For example:\n\`${prefix}ban @${client.user.tag} Spam pinging\``);
        }
      },
    },
    'kick': {
      description: 'Kicks a user from your server',
      usage: `${prefix}kick [@user] {reason}`,
      runIf: function(message, args, period) {
        return message.member.hasPermission('KICK_MEMBERS');
      },
      dm: false,
      run: function(message, args, period) {
        let member = message.mentions.members.first();
        let reason = (args[1]) ? args[1] : 'No reason provided';
        if (member) {
          if (member.id === message.author.id) {
            message.channel.send(`${emojis.error} ${message.member}, you can't kick yourself!`);
          }
          else if (member.id === client.user.id) {
            message.channel.send(`${emojis.error} ${message.member}, I can't kick myself!`);
          }
          else {
            try {
              member.kick(reason);
              message.channel.send(`${emojis.success} Member successfully kicked!`);
            }
            catch (e) {
              message.channel.send(`${emojis.error} There was some kind of error. We're looking into it.`);
              message.client.channels.get('449178631462322187').send({
                embed: {
                  title: 'Error',
                  fields: [
                    { name: `Command`, value: `Kick`, inline: true },
                    { name: `User Tag`, value: message.author.tag, inline: true },
                    { name: `User ID`, value: message.author.id, inline: true },
                    { name: `Error`, value: e, inline: true },
                    { name: `Guild`, value: message.guild.name + ', #' + message.channel.name, inline: true },
                  ],
                }
              });
            }
          }
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, you must provide a user. For example:\n\`${prefix}ban @${client.user.tag} Spam pinging\``);
        }
      },
    },
    'softban': {
      description: 'Kick a user and clears their messages',
      usage: `${prefix}ban [@user] {reason}`,
      runIf: function(message, args, period) {
        return (message.member.hasPermission('KICK_MEMBERS') && message.member.hasPermission('MANAGE_MESSAGES')) || message.member.hasPermission('BAN_MEMBERS');
      },
      dm: false,
      run: function(message, args, period) {
        let member = message.mentions.members.first();
        let reason = (args[1]) ? args[1] : 'No reason provided';
        if (member) {
          if (member.id === message.author.id) {
            message.channel.send(`${emojis.error} ${message.member}, you can't kick yourself!`);
          }
          else if (member.id === client.user.id) {
            message.channel.send(`${emojis.error} ${message.member}, I can't kick myself!`);
          }
          else {
            try {
              member.ban({ days: 7, reason: reason });
              message.guild.unban(member.id);
              message.channel.send(`${emojis.success} Member successfully softbanned!`);
            }
            catch (e) {
              message.channel.send(`${emojis.error} There was some kind of error. We're looking into it.`);
              message.client.channels.get('449178631462322187').send({
                embed: {
                  title: 'Error',
                  fields: [
                    { name: `Command`, value: `Softban`, inline: true },
                    { name: `User Tag`, value: message.author.tag, inline: true },
                    { name: `User ID`, value: message.author.id, inline: true },
                    { name: `Error`, value: e, inline: true },
                    { name: `Guild`, value: message.guild.name + ', #' + message.channel.name, inline: true },
                  ],
                }
              });
            }
          }
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, you must provide a user. For example:\n\`${prefix}ban @${client.user.tag} Spam pinging\``);
        }
      },
    },
    'mute': {
      description: 'Mutes users',
      usage: `${prefix}mute [@user]`,
      runIf: function(message, args, period) {
        return message.member.hasPermission('MANAGE_ROLES') || message.author.id == '270997352939126794';
      },
      dm: false,
      run: function(message, args, period) {
        let type = (period[0] === 'channel') ? 'channel' : 'role';
        let member = message.mentions.members.first();
        if (!member) {
          member = message.guild.members.find('name', args[0])
        }
        if (member) {
          if (member.id === message.author.id) {
            message.channel.send(`I wouldn't mute myself if I were you but ok`);
          }
          
          if (member.id === client.user.id) {
            message.channel.send(`${emojis.error} ${message.member}, I can't mute myself!`);
          }
          else{
            if (type === 'channel') {
              try {
                let channelCol = message.guild.channels;
                channelArr = channelCol.array();
                for (var i = 0; i < channelArr.length; i++) {
                  channelArr[i].overwritePermissions(member, {
                    SEND_MESSAGES: false
                  });
                }
                message.channel.send(`${emojis.success} Member successfully muted!`);
              }
              catch (e) {
                message.channel.send(`${emojis.error} There was some kind of error. We're looking into it.`);
                console.log(e);
                message.client.channels.get('449178631462322187').send({
                  embed: {
                    title: 'Error',
                    fields: [
                      { name: `Command`, value: `Mute: ${type}`, inline: true },
                      { name: `User Tag`, value: message.author.tag, inline: true },
                      { name: `User ID`, value: message.author.id, inline: true },
                      { name: `Error`, value: 'Error: ' + e, inline: true },
                      { name: `Guild`, value: message.guild.name + ', #' + message.channel.name, inline: true },
                    ],
                  }
                });
              }
            }
            else if (type === 'role') {
              if (message.guild.roles.find('name', 'Muted')) {
                member.addRole(message.guild.roles.find('name', 'Muted').id);
                message.channel.send(`${emojis.success} Member muted!`);
              }
              else {
                try {
                  message.guild.createRole({
                    name: 'Muted',
                  }).then(role => {
                    let channelCol = message.guild.channels;
                    channelArr = channelCol.array();
                    for (var i = 0; i < channelArr.length; i++) {
                      channelArr[i].overwritePermissions(role, {
                        SEND_MESSAGES: false
                      });
                    }
                    member.addRole(role);
                    message.channel.send(`${emojis.success} Successfully muted member.`)
                  });
                }
                catch (e) {

                }
              }
            }
          }
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, you must provide a user. For example:\n\`${prefix}mute @${client.user.tag}\``);
        }
      },
    },
    'clear': {
      description: 'Clears X messages in a channel',
      usage: `${prefix}clear [number]`,
      runIf: function(message, args, period) {
        return message.member.hasPermission('MANAGE_MESSAGES') || message.author.id == '270997352939126794';
      },
      dm: false,
      run: function(message, args, period) {
        let num = parseInt(args[0], 0);
        try {
          if (num <= 100) {
            message.channel.bulkDelete(num);
            message.channel.send(`${emojis.success} Successfully deleted ${num} messages.`).then(msg => {
              setTimeout(function() { msg.delete(50); }, 4000);
            });
          }
          else {
            message.channel.send(`${emojis.error} ${message.member}, the number must be less than or equal to 100.`);
          }
        }
        catch (e) {
          message.channel.send(`${emojis.error} There was some kind of error. We're looking into it.`);
          message.client.channels.get('449178631462322187').send({
            embed: {
              title: 'Error',
              fields: [
                { name: `Command`, value: `Clear: ${num}`, inline: true },
                { name: `User Tag`, value: message.author.tag, inline: true },
                { name: `User ID`, value: message.author.id, inline: true },
                { name: `Error`, value: e, inline: true },
                { name: `Guild`, value: message.guild.name + ', #' + message.channel.name, inline: true },
              ],
            }
          });
        }
      },
    },
    'warn': {
      description: 'Warns a user',
      usage: `${prefix}warn [@user] [reason]`,
      runIf: function(message, args, period) {
        return message.member.hasPermission('MANAGE_MESSAGES') || message.member.hasPermission('KICK_MEMBERS') || message.member.hasPermission('BAN_MEMBERS');
      },
      dm: false,
      run: function(message, args, period) {
        let member = message.mentions.members.first();
        let reason = args.splice(1).join(' ');
        if (member) {
          if (reason) {
            member.user.send(`You have been warned in ${message.guild.name}: ${reason}`);
            message.channel.send(`${emojis.success} Successfully warned user.`)
          }
          else {
            message.channel.send(`${emojis.error} ${message.member}, you must provide a reason/warning.`);
          }
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, you must provide a user.`);
        }
      },
    },
  },
  'Fun': {
    'rps': {
      description: 'Play Rock, Paper, Scissors with the bot!',
      usage: `${prefix}rps [choice]`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        let options = ['rock', 'paper', 'scissors'];
        let syn = {
          'rock': 'rock',
          'r': 'rock',
          'rocky': 'rock',
          'stone': 'rock',
          'paper': 'paper',
          'p': 'paper',
          'trees': 'paper',
          'pape': 'paper',
          'scissors': 'scissors',
          's': 'scissors',
          'snipitysnip': 'scissors',
          'snip': 'scissors',
          'banana': 'banana',
        };
        let myChoice = options[Math.floor(Math.random() * options.length)];
        var good = true;
        let yourChoice;
        /*if (!args[0]) {yourChoice = 'banana'}
        else{*/
        yourChoice = syn[args[0].toLowerCase()];
        if (!yourChoice) {
          yourChoice = 'banana';
        }
        if (!good) {
          //message.channel.send(`${emojis.error} ${message.member}, that is not a valid option.\nTry \`rock\`, \`paper\`, or \`scissors\`.`)
        }
        var winner = 'You';
        if (yourChoice) {
          if (myChoice == yourChoice) {
            message.channel.send(`We both chose ${yourChoice}. It's a tie!`);
            return;
          }
          if (yourChoice === 'rock') {
            if (myChoice === 'paper') { winner = 'I'; }
            if (myChoice === 'scissors') { winner = 'You'; }
          }
          if (yourChoice === 'paper') {
            if (myChoice === 'scissors') { winner = 'I'; }
            if (myChoice === 'rock') { winner = 'You'; }
          }
          if (yourChoice === 'scissors') {
            if (myChoice === 'rock') { winner = 'I'; }
            if (myChoice === 'paper') { winner = 'You'; }
          }
          if (yourChoice === 'banana') {
            message.channel.send(`You chose ${yourChoice}, I chose ${myChoice}. James Bond Wins!`);
            return;
          }
          message.channel.send(`You chose ${yourChoice}, I chose ${myChoice}. ${winner} win!`);
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, that is not a valid option. Maybe try \`Rock\`, \`Paper\`, or \`Scissors\`?`);
        }
      },
    },
    'cowsay': {
      description: 'What does the cow say? You decide!',
      usage: `${prefix}cowsay [Words]`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        if (args.join(' ') > 50) {
          message.channel.send(`${emojis.error} ${message.member}, The words will be cut off because your text was longer than 50 characters.`);
        }
        let txt = args.join(' ').slice(0, 50);
        if (!txt || txt == '') {
          txt = 'Moooo!';
        }
        let bar1 = '__________________________________________________'.slice(0, txt.length + 3);
        let bar2 = '--------------------------------------------------'.slice(0, txt.length + 3);

        message.channel.send(`\`\`\`\n ${bar1}\n< ${txt} >\n ${bar2}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\`\`\``);
      },
    },
    'trivia': {
      description: 'Use the reactions to answer these true/false trivia questions.',
      usage: `${prefix}trivia`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        let now = new Date();
        if (now.getTime() - triviaTime.getTime() < 5000) {
          message.channel.send(`${emojis.error} ${message.member}, I'm still on cooldown!`);
          return;
        }
        else {
          triviaTime = new Date();
        }
        var info1;
        let link = 'https://opentdb.com/api.php?amount=1';
        let type;
        if (period[1] === 'tf') {
          link = 'https://opentdb.com/api.php?amount=1&type=boolean';
          type = 'boolean';
        }
        else if (period[1] === 'mc') {
          link = 'https://opentdb.com/api.php?amount=1&type=multiple';
          type = 'multiple';
        }
        link = 'https://opentdb.com/api.php?amount=1&type=boolean';
        request('https://opentdb.com/api.php?amount=1&type=boolean', function(error, response, body) {
          info1 = body;
          var info = JSON.parse(info1);
          if (!info) { return; }
          message.channel.send({
            embed: {
              author: {
                name: 'Trivia',
                icon_url: 'https://cdn.discordapp.com/attachments/448927828570800138/449549625628819456/true-false.png',
              },
              description: `Use the reactions to answer.`,
              color: embedColor,
              fields: [
                { name: `Category`, value: info['results']['0']['category'], inline: true, },
                { name: `Difficulty`, value: cap(info['results']['0']['difficulty']), inline: true, },
                { name: `Type`, value: info['results']['0']['type'] === 'boolean' ? 'True/false\n' : 'Multiple Choice\n', inline: true },
                { name: `Answer`, value: `Not answered yet`, inline: true, },
                { name: `Question`, value: format(info['results']['0']['question']), inline: false },
              ],
            }
          }).then(msg => {
            msg.react('487316006843449354');
            msg.react('487316007040581632');
            trivia = {
              on: true,
              id: message.author.id,
              msgId: msg.id,
              correctReaction: (info['results']['0']['correct_answer'] === 'True' ? '487316006843449354' : '487316007040581632'),
              cat: info['results']['0'],
            };
          });

        });
      },
    },
    'scramble': {
      description: 'Unscramble a random word!',
      usage: `${prefix}scramble`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        if (!period[1]) {
          let word = randomWords().toUpperCase();
          let scramWord = wordscramble.scramble(word);
          let letters = "";
          for (var i = 0; i < scramWord.length; i++) {
            letters += `:regional_indicator_${scramWord[i].toLowerCase()}:`;
          }

          scramble = {
            running: true,
            userID: message.author.id,
            word: word,
            scrambled: scramWord,
            letters: letters,
          };
          message.channel.send({
            embed: {
              title: 'Unscramble This',
              color: embedColor,
              description: `Use \`${prefix}scramble.guess [your guess]\` to guess.\n\n${letters}`,
            }
          }).then(msg => {
            scramble.msgId = msg.id;
          });
        }
        else if (scramble.running) {
          if (args[0].toUpperCase() === scramble.word) {
            setTimeout(function() { message.delete(50); }, 5000);
            message.channel.fetchMessage(scramble.msgId).then(msg => {
              msg.edit({
                embed: {
                  title: 'Unscramble This',
                  color: embedColor2,
                  description: `Answer: ${cap(scramble.word)} - answered by ${message.author.tag}\n\n${scramble.letters}`,
                }
              });
            });
            scramble.running = false;
          }
          else {
            message.channel.send(`${message.author.username} is wrong!`).then(msg => {
              setTimeout(function() { msg.delete(50); }, 5000);
            });
          }
        }
      },
    },
    'lolcat': {
      description: 'Translate text to the language cats speak!',
      usage: `${prefix}lolcat [text]`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        if (args[0]) {
          var m = lolcat(args.join(' '));
          message.channel.send({
            embed: {
              title: 'Translation complete',
              description: m,
            }
          })
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, Invalid input.`);
        }
      },
    },
    'doge': {
      description: 'very doge much wow',
      usage: `${prefix}doge [text]`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        if (args[0]) {
          var m = doge(args.join(' '));
          message.channel.send({
            embed: {
              title: 'Translation complete',
              description: m,
            }
          })
        }
        else {
          message.channel.send(`${emojis.error} ${message.member}, Invalid input.`);
        }
      },
    },
    'roll': {
      description: 'Rolls a six-sided die.',
      usage: `${prefix}roll`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        var diceNum = Math.floor(1 + Math.random() * 6);
        message.channel.send({
          embed: {
            color: 0xfdcb6e,
            title: 'Roll a die: ' + (diceNum),
            image: {
              url: `http://platformerking.com/dotbot/dice-${diceNum}.png`
            },
          }
        });
      },
    },
    'flipacoin': {
      description: 'Flips a coin.',
      usage: `${prefix}flipacoin`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        var coin = Math.floor(Math.random() * 2);
        var coinName = coin === 0 ? 'head' : 'tail';
        message.channel.send({embed: {
          title: `Flip A Coin: ${coinName}s`,
          color: 0xa29bfe,
          image: {
            url: `http://platformerking.com/dotbot/coin-${coinName}.png`
          }
        }});
      },
    },
    'color': {
      description: 'Generates a random color.',
      usage: `${prefix}color`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        var color = randomColor();
        message.channel.send({
          embed: {
            color: parseInt("0x" + color.slice(1, color.length), 0),
            title: "Random Color",
            description: "Hex Value: " + color,
            thumbnail: {
              url: `https://dummyimage.com/400x400/${color.slice(1, color.length)}.png&text=+`
            },
          }
        });
      },
    },
    'qr': {
      description: 'Generates a QR Code.',
      usage: `${prefix}qr [text or url]`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        var code = qr.image(args.join(" "), { type: 'png' });
        var output = fs.createWriteStream('qrgen.png');
        code.pipe(output);
        message.channel.send("Here is a QR code for `" + args.join(" ") + "`!", {
          file: "qrgen.png"
        });
      },
    },
    /*'changemymind': {
      description: 'description',
      usage: `${prefix}cmd [required] {optional}`,
      runIf: null,
      dm: true,
      run: function(message, args, period) {
        var ooo = cloudinary.url("https://res.cloudinary.com/demo/image/upload/w_250,h_168,c_fit/sample.jpg", {overlay: {font_family: "Arial", font_size: 45, font_weight: "bold", text: "Hello%20World"}, gravity: "face", angle: 19, flags: "region_relative", width: "0.5"});
        console.log(ooo);
        message.channel.send({embed: {
          "image": {
            "url": ooo,
          },
        }});
      },
    },*/
  }
};

client.on('message', message => {
  if (message.author.bot || message.author.id === client.user.id) { return }
  let args = message.content.split(' ').splice(1);
  let commandWPrefix = message.content.toLowerCase().split(" ")[0];
  let commandName = commandWPrefix.slice(1, commandWPrefix.length);
  let period = commandName.split('.');
  let command;
  if (!message.content.startsWith(prefix)) { return; }
  for (var i in commands) {
    if (commands[i][period[0]]) {
      command = commands[i][period[0]];
      if (message.channel.type === "dm" && !command.dm) {
        message.channel.send(`${emojis.error} ${message.member}, you can't use this command in a DM.`);
      }
      else {
        /*if (!command.runIf === null && !command.runIf(message, args, period) == true /*&& !(command.runIf === 'owner' && message.author.id === "270997352939126794")) {
          message.channel.send(`${emojis.error} ${message.member}, you don't have the right permissions for that command.`);
        }else {
          command.run(message, args, period);
        }*/
        if (command.runIf == null || command.runIf(message, args, period)) {
          command.run(message, args, period);
        }else{
          message.channel.send(`${emojis.error} ${message.member}, you don't have the right permissions for that command.`);
        }
      }
    }
  }
});

client.on('messageReactionAdd', (r, user) => {
  if (trivia.on && r.message.id === trivia.msgId && user.id !== client.user.id) {
    if (r.emoji.id === trivia.correctReaction) {
      r.message.edit({
        embed: {
          author: {
            name: 'Trivia',
            icon_url: 'https://cdn.discordapp.com/attachments/448927828570800138/449549625628819456/true-false.png',
          },
          description: `Use the reactions to answer.`,
          color: embedColor2,
          fields: [
            { name: `Category`, value: trivia.cat['category'], inline: true, },
            { name: `Difficulty`, value: cap(trivia.cat['difficulty']), inline: true, },
            { name: `Type`, value: trivia.cat['type'] === 'boolean' ? 'True/false\n' : 'Multiple Choice\n', inline: true },
            { name: `Answer`, value: `${trivia.cat['correct_answer']} - answered by ${user.tag}`, inline: true, },
            { name: `Question`, value: format(trivia.cat['question']), inline: false },
          ],
        }
      });
      trivia.on = false;
    }
    else {
      r.message.channel.send(`${user.username} is wrong!`).then(msg => {
        setTimeout(function() { msg.delete(50); }, 5000)
      });
      r.remove(user);
    }

  }
});
function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
client.login(process.env.token);

