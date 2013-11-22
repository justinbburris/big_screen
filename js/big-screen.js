var fs      = require('fs');
var express = require('express');
var restler = require('restler');
var uuid    = require('node-uuid');

// App Initialization
var app = express();
app.use(express.bodyParser());

app.post('/', function(req, res) {
  var chartData = {
    "infile": req.body.svg,
    "scale": req.body.scale,
  };

  var filename = req.body.filename;
  var outfile  = "tmp/chart-" + uuid.v4();

  switch(req.body.type) {
  case "image/png":
    filename += '.png';
    break;
  case "image/jpeg":
    filename += '.jpg';
    break;
  case "application/pdf":
    filename += '.pdf';
    outfile += '.pdf';
    chartData.outfile = outfile;
    break;
  }

  chartData = JSON.stringify(chartData);

  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-Transfer-Encoding', 'binary');
  res.setHeader('Content-Type', req.body.type);

  restler.post('http://127.0.0.1:3003', {
    headers: { 'Content-Type': 'application/json', 'Content-Length': chartData.length },
    data: chartData
  }).once('complete', function(result, response) {
    if(req.body.type == 'application/pdf') {
      fs.readFile('highcharts-phantomjs/' + outfile, function(err, data) {
        res.send(data);
        fs.unlink('highcharts-phantomjs/' + outfile);
      });
    } else {
      res.send(new Buffer(result, 'base64')); 
    }
  });
});

// Start this baby up!
app.listen(1337);
