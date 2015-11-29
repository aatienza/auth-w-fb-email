require('babel-core/register')({
    "presets": ["react", "es2015"]
});

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , async = require('async');


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'build')));
});

app.configure('development', function() {
  console.log('Using development settings.');
  // app.set('connection', mysql.createConnection({
  //   host: '',
  //   user: '',
  //   port: '',
  //   password: ''}));
  app.use(express.errorHandler());
});

console.log( JSON.stringify(process.env) );

app.configure('production', function() {
  console.log('Using production settings.');

  var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    database : 'aa1f9k8x0fb8inx',
    charset  : process.env.RDS_PORT
  }
});
  // app.set('connection', mysql.createConnection({
  //   host: process.env.RDS_HOSTNAME,
  //   user: process.env.RDS_USERNAME,
  //   password: process.env.RDS_PASSWORD,
  //   port: process.env.RDS_PORT}));
});

function init() {
  app.get('/', routes.index);

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
}

var client = app.get('connection');

init();
