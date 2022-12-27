require('dotenv').config();

const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const csv = require('csvtojson');

const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://192.168.1.70:3000"
  }
});
const { gql, ApolloClient, InMemoryCache } = require('@apollo/client');


// Discord
const { Client, Events, GatewayIntentBits } = require('discord.js');
const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
bot.once(Events.ClientReady, c => {
	console.log(`Discord bot ready! Logged in as ${c.user.tag}`);
  bot.user.setPresence({ activities: [{ name: "I'm watching your system..." }], status: 'online' });
});
bot.login(process.env.DISCORD_TOKEN);

const csvFilePath = '/var/log/snort/alert.csv';

app.use(cors());
app.use(bodyParser.json());

// Read file in real-time
Tail = require('tail').Tail;
tail = new Tail("/var/log/snort/alert.csv");
tail.on("error", function (error) {
  console.log('Tail error: ', error);
});

// Real-time alerts
io.on('connection', (socket) => {
  console.log('A user has connected to the socket');
  socket.on('disconnect', () => {
    console.log('A user has disconnected from the socket');
  });
});

tail.on("line", (data) => {
  csv({
    noheader: true,
    headers: ["time", "sid", "prot", "msg", "src", "srcport", "dest", "dstport"]
  })
    .fromString(data)
    .then(jsonObj => {
      const alert = jsonObj[0];
      io.emit('new alert', alert.msg + " - " 
      + (alert.prot == "" ? (alert.msg.includes("TCP") ? "TCP" : (alert.msg.includes("UDP") ? "UDP" : (alert.msg.includes("ICMP") ? "ICMP" : null))) : alert.prot)
      + " - " + alert.src + " -> " + alert.dest + " port " + alert.dstport);
      const client = new ApolloClient({
        uri: 'http://192.168.1.70:3000/api/graphql',
        cache: new InMemoryCache()
      });
      const CREATE_ALERT = gql`
      mutation CreateAlert($time: DateTime, $prot: String, $msg: String, $src: String, $srcport: Int, $dest: String, $dstport: Int, $SID: Int){
        createAlert(data: {
          timestamp: $time, 
          protocol: $prot,
          message: $msg,
          sourceIP: $src,
          sourcePort: $srcport,
          destinationIP: $dest,
          destinationPort: $dstport,
          SID: $SID
        }){
          timestamp,
          message
        }
      }
      `;
      client.mutate({
        mutation: CREATE_ALERT,
        variables: {
          time: new Date(alert.time).toISOString(),
          prot: alert.prot == "" ? (alert.msg.includes("TCP") ? "TCP" : (alert.msg.includes("UDP") ? "UDP" : (alert.msg.includes("ICMP") ? "ICMP" : null))) : alert.prot,
          msg: alert.msg,
          src: alert.src,
          srcport: Number(alert.srcport),
          dest: alert.dest,
          dstport: Number(alert.dstport),
          SID: Number(alert.sid)
        }
      }).then(res => {
        // console.log(res);
      }).catch(err => {
        console.log(err);
      });

      // notify on discord
      const alertEmbed = {
        color: 0x0099ff,
        title: 'Intrusion detected!',
        url: 'http://192.168.1.70:3000/alerts',
        fields: [
          {
            name: 'Alert message',
            value: alert.msg,
          },
          {
            name: 'Protocol',
            value: alert.prot == "" ? (alert.msg.includes("TCP") ? "TCP" : (alert.msg.includes("UDP") ? "UDP" : (alert.msg.includes("ICMP") ? "ICMP" : ""))) : alert.prot,
            inline: true,
          },
          {
            name: 'Source',
            value: alert.src,
            inline: true,
          },
          {
            name: 'Destination',
            value: alert.dest,
            inline: true,
          },
          {
            name: 'Port',
            value: Number(alert.dstport),
            inline: true,
          }
        ],
        timestamp: new Date(alert.time).toISOString(),
        footer: {
          text: 'PBL6 Snort IDS Bot',
        },
      };
      const channel = bot.channels.cache.get('1056418878407839838');
      if (channel) channel.send({ embeds: [alertEmbed] });    
    })
});

app.set('port', process.env.PORT || 8000);

server.listen(app.get('port'), () => {
  console.log(`Express server is running on PORT ${server.address().port}`);
});