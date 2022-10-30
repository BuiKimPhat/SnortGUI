require('dotenv').config();

const express = require('express');
var cors = require('cors');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const csv = require('csvtojson');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

// Read all alerts
app.get('/alerts', (req,res) => {
  const csvFilePath = '/var/log/snort/alert.csv';
  csv({
    noheader: true,
    headers: ["time","prot","mess","src","dest"]
  })
  .fromFile(csvFilePath)
  .then(jsonObj => {
    res.status(200).json(jsonObj)
  })
})

app.get('/statistic', (req,res) => {
  const csvFilePath = '/var/log/snort/alert.csv';
  csv({
    noheader: true,
    headers: ["time","prot","mess","src","dest"]
  })
  .fromFile(csvFilePath)
  .then(jsonObj => {
    var tcp = 0;
    var udp = 0;
    var icmp = 0;
    var arp = 0;
    var other = 0;
    jsonObj.forEach(alert => {
      switch(alert.prot){
        case "TCP":
          tcp++;
          break;
        case "UDP":
          udp++;
          break;
        case "ICMP":
          icmp++;
          break;
        case "ARP":
          arp++;
          break;
        default:
          other++;
          break;
      }
    });
    var ip = tcp+udp+icmp+arp;
    res.status(200).json({ip: ip, tcp: tcp, udp: udp, icmp: icmp, arp: arp, all: ip+other})
  })
})

app.post('/subscribe', (req, res) => {
  const subscription = req.body

  res.status(201).json({});

  const payload = JSON.stringify({
    title: 'Push notifications with Service Workers',
  });

  webPush.sendNotification(subscription, payload)
    .catch(error => console.error(error));
});

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is running on PORT ${server.address().port}`);
});