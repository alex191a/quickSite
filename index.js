
// Require
const express = require("express");
const app = express();
const port = 3050;

// Express sessions
const session = require("express-session");

// Bcrypt til hashing af passwords.
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

// Mysql
var mysql = require('sync-mysql');
var conn = new mysql({
	host: 'famas.ml',
	user: 'quickDB',
	password: '!Password1!',
	database: "quicksite"
});

// get the client
const mysql2 = require('mysql2');
// create the connection to database
const conn2 = mysql2.createConnection({
	host: 'famas.ml',
	user: 'quickDB',
	password: '!Password1!',
	database: 'quicksite'
});

app.get("/", (req,res) =>{

	// Tjek om logget ind
	if (req.session.loggedIn) {
		res.send(`This is a quickSite API endpoint! - ${req.session.username}`);
	}else {
		res.send("You are not logged in!");
	}

})

app.get("/session", (req,res) => {

	// Start session
	req.session.loggedIn = true;
	req.session.username = "mortenand123"

	// Send tilbage til startsiden
	res.redirect("/");

})

// Post login
app.post("/auth", (req,res) => {

	// Opret echo som sendes om svar til sidst
	var echo = {
		err: "",
		errCode: 0,
		success: false,
		status: ""
	}

	// Post login params
	var username = req.body.username;
	var password = req.body.password;

	// Tjek om dette brugernavn findes
	var result = conn.query(`SELECT * FROM Users WHERE username = "${username}" LIMIT 1`);

	// Tjek om denne bruger findes i result array
	if (result.length > 0) {
		
		// Opret variabler
		var passwordHash = result[0].password;

		// Tjek om passwords stemmer overens
		if (bcrypt.compareSync(password, passwordHash)) {

			// Opdater echo
			echo.success = true;
			echo.status = "Login found and password correct!"

		}else {

			// Opdater echo
			echo.success = false;
			echo.status = "Login found but password is incorrect!";

		}

	}else {
		
		// Opdater echo
		echo.success = false;
		echo.status = "Login not found!";

	}
	
	// Send echo
	res.send(echo);

})

// Opret ny bruger
app.post("/signup", (req,res) => {

	// Opret echo som sendes om svar til sidst
	var echo = {
		err: "",
		errCode: 0,
		success: false,
		status: ""
	}

	// Opret variabler
	var username = req.body.username;
	var password = req.body.password;

	// Log
	console.log(`New user request: username: ${username} - pass: ${password}`)

	// Hash password
	const salt = bcrypt.genSaltSync(saltRounds);
	const passwordHash = bcrypt.hashSync(password, salt);

	// Opret ny bruger i DB.
	conn2.query(`INSERT INTO Users (username, password) VALUES ("${username}", "${passwordHash}")`, 
	(err, results, fields) => {
		if (err) {
		
			// Opdater echo med errors
			echo.err = err;
			echo.errCode = 500;
			echo.success = false;

			res.send(echo);
		
			throw err;
		}

		console.log("Results", results);
		console.log("Fields", fields);

		// Opdater echo
		echo.success = true;
		echo.status = "User created with username: " + username;

		res.send(echo);

	})

})

// Start express server
app.listen(port, () => console.log(`App started on port: ${port}!`))