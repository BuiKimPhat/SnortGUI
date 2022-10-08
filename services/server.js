require('dotenv').config();

const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const csv = require('csvtojson');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

// Read all alerts
app.get('/alerts', (req,res) => {
  const csvFilePath = '/var/log/snort/alert.csv';
  csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    console.log(jsonObj)
    res.status(200).json(jsonObj)
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