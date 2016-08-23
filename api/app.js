var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var beautifulUniq = require('mongoose-beautiful-unique-validation');
var routes = require('./config/routes');

mongoose.plugin(beautifulUniq);
mongoose.connect('mongodb://localhost/multer-uploader');

var PORT = process.env.PORT || 3000;

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', routes);

app.listen(PORT, function() { console.log("Up and running") });