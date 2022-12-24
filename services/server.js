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
  io.emit('new alert', data);
  csv({
    noheader: true,
    headers: ["time", "sid", "prot", "msg", "src", "srcport", "dest", "dstport"]
  })
    .fromString(data)
    .then(jsonObj => {
      const alert = jsonObj[0];
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
          prot: alert.prot,
          msg: alert.msg,
          src: alert.src,
          srcport: Number(alert.srcport),
          dest: alert.dest,
          dstport: Number(alert.dstport),
          SID: Number(alert.sid)
        }
      })
    })
});

// Get statistics
// app.get('/statistic', (req,res) => {
//   const csvFilePath = '/var/log/snort/alert.csv';
//   csv({
//     noheader: true,
//     headers: ["time","prot","mess","src","dest"]
//   })
//   .fromFile(csvFilePath)
//   .then(jsonObj => {
//     var tcp = 0;
//     var udp = 0;
//     var icmp = 0;
//     var arp = 0;
//     var other = 0;
//     jsonObj.forEach(alert => {
//       switch(alert.prot){
//         case "TCP":
//           tcp++;
//           break;
//         case "UDP":
//           udp++;
//           break;
//         case "ICMP":
//           icmp++;
//           break;
//         case "ARP":
//           arp++;
//           break;
//         default:
//           other++;
//           break;
//       }
//     });
//     var ip = tcp+udp+icmp+arp;
//     res.status(200).json({ip: ip, tcp: tcp, udp: udp, icmp: icmp, arp: arp, all: ip+other})
//   })
// })

app.set('port', process.env.PORT || 8000);

server.listen(app.get('port'), () => {
  console.log(`Express server is running on PORT ${server.address().port}`);
});