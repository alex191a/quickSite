
// Require
const express = require("express");
const app = express();
const port = 3050;

// Express sessions
const session = require("express-session");

// Body parser m.m. til POST info
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var cookieParser = require('cookie-parser');

// Opstart disse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());

// Opstart sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: '!Password1!',
	resave: false,
	saveUninitialized: true,
}))

// Mysql login info
// Username: quickDB
// Password: !Password1!
// Server: famas.ml
// Database: quicksite

app.get("/", (req,res) =>{

	// Tjek om logget ind
	if (req.session.loggedIn) {
		res.send("This is a quickSite API endpoint!");
	}else {
		res.send("You are not logged in!");
	}

})

app.get("/session", (req,res) => {

	// Start session
	req.session.loggedIn = true;

	// Send
	res.send("Session started!");


})

// Start express server
app.listen(port, () => console.log("App started!"))