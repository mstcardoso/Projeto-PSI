var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Import the url module from Node.js
const url = require('url');

var websiteRoutes = require('./routes/websiteRoutes');
var cors = require('cors');
var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', websiteRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// const mongoDB = "mongodb://psi040:psi040@localhost:27017/psi040?retryWrites=true&authSource=psi040";
const mongoDB = "mongodb+srv://mstcardoso94:1D4694pTmQvTJICm@psi.ptobisv.mongodb.net/?retryWrites=true&w=majority&appName=psi";
// const mongoDB =  "mongodb+srv://fc58238:fc58238@cluster0.jtlfcbi.mongodb.net/psi?retryWrites=true&w=majority&appName=Cluster0";
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

module.exports = app;
