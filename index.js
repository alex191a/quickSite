
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

// Sæt view-engine
app.set("view engine", "ejs");

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

	if (username in req.body && password in req.body){

		// Post login params
		var username = req.body.username;
		var password = req.body.password;

		// Tjek om dette brugernavn findes
		var result = conn.query(`SELECT * FROM Users WHERE username = "${username}" LIMIT 1`);

		// Tjek om denne bruger findes i result array
		if (result.length > 0) {
			
			// Opret variabler
			var passwordHash = result[0].password;
			var userID = result[0].id;

			// Tjek om passwords stemmer overens
			if (bcrypt.compareSync(password, passwordHash)) {

				// Opdater echo
				echo.success = true;
				echo.status = "Login found and password correct!"

				// Sæt session token
				req.session.loggedIn = true;
				req.session.username = username;
				req.session.userID = userID;

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

	}else {

		// Opdater echo
		echo.success = false;
		echo.status = "Username or password not defined";

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

	// Tjek om brugernavn og adgangskode er defineret
	if (username in req.body && password in req.body){

		// Opret variabler
		var username = req.body.username;
		var password = req.body.password;

		// Log
		console.log(`New user request: username: ${username} - pass: ${password}`)

		// Hash password
		const salt = bcrypt.genSaltSync(saltRounds);
		const passwordHash = bcrypt.hashSync(password, salt);

		// Tjek om brugernavnet allerede findes i DB.
		var userCheck = conn.query(`SELECT * FROM Users WHERE username = "${username}"`);

		if (!(userCheck.length > 0)) {

			// Opret bruger i DB
			var result = conn.query(`INSERT INTO Users (username, password) VALUES ("${username}", "${passwordHash}")`);

			console.log("Results", result);

			// Opdater echo
			echo.success = true;
			echo.status = "User created with username: " + username;

		}else {

			// Brugernavnet findes allerede
			// Opdater echo
			echo.success = false;
			echo.err = `Username: '${username}' already exists!`;
			echo.errCode = 500;

		}

	}else {

		// Opdater echo
		echo.success = false;
		echo.status = "Username or password not defined";

	}

	res.send(echo);

})

// Get sites
app.get("/getSites", (req,res) => {

	// Opret echo som sendes om svar til sidst
	var echo = {
		err: "",
		errCode: 0,
		success: false,
		status: "",
		data: ""
	}

	// Tjek om bruger er logget ind
	if (req.session.loggedIn) {
		
		// Bruger er logget ind
		// Opret vars
		var loginUser = req.session.username;
		var loginUserID = req.session.userID;

		// MYSQL Query
		var result = conn.query(`SELECT * FROM Sites WHERE user_id = "${loginUserID}"`);

		// Opdater echo
		echo.data = result;
		echo.success = true;
		echo.status = "Get all sites";

	}else {

		// Bruger er ikke logget ind
		echo.success = false;
		echo.err = "User not logged in!";
		echo.errCode = 403;

	}

	res.send(echo);

})

// Create sites
app.post("/createSite", (req,res) => {

	// Opret echo som sendes om svar til sidst
	var echo = {
		err: "",
		errCode: 0,
		success: false,
		status: "",
		data: ""
	}

	// Tjek om brugeren er logget ind
	if (req.session.loggedIn) {

		// Bruger er logget ind
		// Tjek om alle parametre er blevet udfyldt.
		/* name, contact_mail, contact_phone, contact_name, contact_address, text, skabelon_id */
		var pbody = req.body;

		if (pbody.name && pbody.contact_mail && pbody.contact_phone && pbody.contact_name && pbody.contact_address && pbody.text && pbody.skabelon_id && pbody.sub_domain) {

			// Alle vars er sat
			echo.success = true;
			echo.status = "Alle variabler fundet!";
			echo.data = pbody;

			// Tjek om sub_domain er unik
			var subCheck = conn.query(`SELECT * FROM Sites WHERE sub_domain = "${pbody.sub_domain}"`);

			// tjek
			if (subCheck.length > 0) {

				// Side eksisterer allerede
				echo.success = false;
				echo.status = "This sub_domain already exists!";

			}else {

				// Opret ny site i mysql
				var result = conn.query(`INSERT INTO Sites (name, contact_mail, contact_phone, contact_name, contact_address, text, skabelon_id, user_id, sub_domain) VALUES ("${pbody.name}", "${pbody.contact_mail}", "${pbody.contact_phone}", "${pbody.contact_name}", "${pbody.contact_address}", "${pbody.text}", "${pbody.skabelon_id}", "${req.session.userID}", "${pbody.sub_domain}")`)
				
				console.log("Results", result);

				// Opdater echo
				echo.success = true;
				echo.status = "Site oprettet: " + pbody.name;

			}
			

		}else {

			// Ikke alle variabler er udfyldt
			echo.success = false;
			echo.status = "Ikke alle variabler er udfyldt";
			echo.dataSentErr = pbody;

		}

	}else {

		// Bruger ikke logget ind
		echo.success = false;
		echo.err = "User not logged in!";
		echo.errCode = 403;

	}

	// Send echo
	res.send(echo);

})

// Delete site
app.delete("/deleteSite", (req,res) => {

	// Opret echo som sendes om svar til sidst
	var echo = {
		err: "",
		errCode: 0,
		success: false,
		status: "",
		data: ""
	}

	// Tjek om brugeren er online
	if (req.session.loggedIn) {

		// Tjek om variabler er udfyldt
		if (req.session.userID && req.body.site_id) {

			// Alle variabler er udfyldt
			// Tjek om userID og user_id i mysql stemmer overens
			var userCheck = conn.query(`SELECT * FROM Sites WHERE user_id = "${req.session.userID}" AND id = "${req.body.site_id}"`);

			// If length
			if (userCheck.length > 0) {

				// Det hele stemmer overens
				// Fjern denne fra DB
				var deleteMysql = conn.query(`DELETE FROM Sites WHERE user_id = "${req.session.userID}" AND id = "${req.body.site_id}"`);

				// Opdater echo
				echo.success = true;
				echo.status = `Site with id: ${req.body.site_id} has been deleted!`;
			
				// console.log
				// console.log("Delete", deleteMysql);

			}else {
				
				// Dette site tilhører ikke denne bruger
				echo.success = false;
				echo.err = "This site does not exists or it does not belong to you!";
				echo.errCode = 403;

			}

		}else {

			// Ikke alle variabler er udfyldt
			echo.success = false;
			echo.status = "Ikke alle variabler er udfyldt!";

		}

	}else {

		// Bruger ikke logget ind
		echo.success = false;
		echo.err = "User not logged in!";
		echo.errCode = 403;

	}

	// Send echo
	res.send(echo)


	
})

// Render site
app.get("/s/:site/", (req,res) => {

	// Opret variabler
	var siteParam = req.params.site;

	// Tjek om denne site eksisterer
	var siteCheck = conn.query(`SELECT s.*, sk.placement FROM Sites s LEFT JOIN Skabeloner sk ON s.skabelon_id = sk.id WHERE s.sub_domain = "${siteParam}" LIMIT 1`);

	// Tjek
	if (siteCheck.length > 0) {

		// Ny var med kun siteInfo
		var siteInfo = siteCheck[0];

		// Render med EJS
		res.render(`./skabeloner/${siteInfo.placement}`, {siteInfo: siteInfo});

	}else {

		res.redirect("/");

	}

})


// 404
app.use("*", (req,res) => {
	
	// Send 404
	res.send("404 page not found...");

})

// Start express server
app.listen(port, () => console.log(`App started on port: ${port}!`))