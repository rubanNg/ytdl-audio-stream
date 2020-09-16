const express = require('express');
const fs = require('fs');

const { load } = require('./ytdl-events');

const app = express();
const port = process.env.PORT || 3000;


app.get('/', function (req, res) {
  res.send('MAIN');
});

app.get('/audio/:videoId', function (req, res) {
  load(req.params.videoId).then((result) => {

    const total = result.length;

    if (req.headers.range) {
      var range = req.headers.range;
      var parts = range.replace(/bytes=/, "").split("-");
      var partialstart = parts[0];
      var partialend = parts[1];

      var start = parseInt(partialstart, 10);
      var end = partialend ? parseInt(partialend, 10) : total-1;
      var chunksize = (end-start)+1;

      res.writeHead(206, {
          'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
          'Accept-Ranges': 'bytes', 
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg'
      });
      result.data.pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
      result.data.pipe(res);
    }
  })
});

app.get('/edit/:channelId/:action', function(req, res) {

  if (!req.params.action) res.send('NEED ACTION');
  if (!req.params.channelId) res.send('NEED CHANNELID');

  fs.readFile('./channels.json', 'utf8', function (err, data) {
    if (err) res.send({ message: err.message });

    let obj = Array.from(JSON.parse(data));
    switch (req.params.action) {
      case "add":
        if (obj.indexOf(req.params.channelId) !== -1) res.send({ message: 'EXIST', state: obj })
        else obj.push(req.params.channelId);
        break;
      case "remove":
        obj = obj.filter(id => id !== req.params.channelId);
        break;
    }

    fs.writeFile('./channels.json', JSON.stringify(obj), function() {
      res.send({ message: 'SUCCESS', state: obj });
    });
  });
});

app.get('/list', function(req, res) {
  fs.readFile('./channels.json', 'utf8', function (err, data) {
    if (err) res.send([]);
    res.send(data);
  });
});



app.use(express.static('public'));
app.listen(port, () => { console.log('run'); });