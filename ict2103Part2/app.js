var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var fs = require("fs");
var cors = require('cors');

app.use(cors());
app.options('*', cors()) // include before other routes

app.use(bodyParser.json({limit: '1000mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '1000mb', extended: true}))

// parse application/json
app.use(bodyParser.json());


var loginController    = require('./controllers/login');
var userController    = require('./controllers/user');
var studentController  = require('./controllers/student');
var adminController  = require('./controllers/admin');

app.use('/login', loginController);
app.use('/user', userController);
app.use('/student', studentController);
app.use('/admin', adminController);

var eventController    = require('./controllers/event');
var locationController    = require('./controllers/location');
var clinicController    = require('./controllers/clinic');
var schoolroomController    = require('./controllers/schoolroom');
var booksController    = require('./controllers/books');
var weatherController    = require('./controllers/weather');
var faultController    = require('./controllers/fault');
var lostController    = require('./controllers/lostandfound');
var courseController    = require('./controllers/course');
var faultcloudController    = require('./controllers/faultcloud');
var departmentController    = require('./controllers/department');

app.use('/event', eventController);
app.use('/location', locationController);
app.use('/clinic', clinicController);
app.use('/schoolroom', schoolroomController);
app.use('/books', booksController);
app.use('/weather', weatherController);
app.use('/fault', faultController);
app.use('/lost', lostController);
app.use('/course', courseController);
app.use('/faultcloud', faultcloudController);
app.use('/department', departmentController);

var dir = path.join(__dirname, 'public');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

app.get('*', function (req, res) {
  var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
  if (file.indexOf(dir + path.sep) !== 0) {
      return res.status(403).end('Forbidden');
  }
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function () {
      res.set('Content-Type', type);
      s.pipe(res);
  });
  s.on('error', function () {
      res.set('Content-Type', 'text/plain');
      res.status(404).end('Not found');
  });
});

app.get('/', function (req, res) {
  res.send('Test mesage1');
});

app.post('/', function (req, res) {
  res.send('JOSEPH WORKS!!!');
});
app.listen(3001, function () {
  console.log('Example app listening on port 3001');
});