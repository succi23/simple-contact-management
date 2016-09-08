'use strict';

const
  express    = require('express'),
  bodyParser = require('body-parser'),
  mongoose   = require('mongoose'),
  config     = require('./app/config.json');

let
  app    = express(),
  port   = process.env.PORT || config.PORT,
  routes = require('./app/routes/index');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
  // res.json({
  //   success: true,
  //   status: "Started",
  //   startTime: new Date().toString()
  // })
  res.sendFile(__dirname + '/client/index.html');
});

app.use('/api', routes);

mongoose.connect(config.MONGO_URL, () => {
  console.log('Database dah melayang');
})

app.listen(port, () => {
  console.log(`Server dah terbang pake port ${port}` );
});
