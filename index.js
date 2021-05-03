
// Require
const express = require("express");

const app = express();
const port = 3050;

// Fs
const fs = require("fs");

// Express sessions
const session = require("express-session");

// Bcrypt til hashing af passwords.
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Body parser m.m. til POST info
var bodyParser = require('body-parser');
/* var multer = require('multer');
var upload = multer();  */
var cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// Opstart disse
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
/* app.use(upload.array()); */
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

// Root
app.get("/", (req,res) =>{

	res.render("./pages/index", {loginState: req.session});

	// Tjek om logget ind
	/* if (req.session.loggedIn) {
		res.send(`This is a quickSite API endpoint! - ${req.session.username}`);
	}else {
		res.send("You are not logged in!");
	} */

})

// Start ny "fake" session
/* app.get("/session", (req,res) => {

	// Start session
	req.session.loggedIn = true;
	req.session.username = "Peter";
	req.session.userID = 8;

	// Send tilbage til startsiden
	res.redirect("/");

}) */

// Login Side
app.get("/login", (req,res) => {

	// Render
	res.render("./pages/login", {loginState: req.session})

})

// Opret site
app.get("/opret-site", (req,res) => {

	// Get alle skabeloner
	var skabelonCheck = conn.query("SELECT * FROM Skabeloner");

	// Tjek om brugeren er logget ind
	if (req.session.loggedIn) {
		
		// Render
		res.render("./pages/createsite", {loginState: req.session, skabeloner: skabelonCheck});
	
	}else {

		// Redir
		res.redirect("/login");

	}

})

// MySites
app.get("/mySites", (req,res) => {

	if (req.session.loggedIn) {

		// Opret login vars
		var loginUser = mysql2.escape(req.session.username);
		var loginUserID = mysql2.escape(req.session.userID);

		// Get alle sites
		var siteInfo = conn.query(`SELECT * FROM Sites WHERE user_id = ${loginUserID}`);

		// Render
		res.render("./pages/mysites", {loginState: req.session, siteInfo: siteInfo});

	}else {

		// Redir
		res.redirect("/login");

	}

})

// Rediger site
app.get("/rediger-site/:site_domain/", (req,res) => {

	// Opret var til denne
	var site_domain = mysql2.escape(req.params.site_domain);

	// Tjek om brugeren er logget ind.
	if (req.session.loggedIn) {
		
		// Opret vars til logget ind bruger
		var loginUser = mysql2.escape(req.session.username);
		var loginUserID = mysql2.escape(req.session.userID);
	
		// Tjek om dette domæne tilhører denne bruger
		var domainCheck = conn.query(`SELECT * FROM Sites WHERE user_id = ${loginUserID} AND sub_domain = ${site_domain}`);

		// Få alle skabelon_id'er
		var skabelonCheck = conn.query("SELECT * FROM Skabeloner");

		// Tjek resultatet
		if (domainCheck.length > 0) {

			// Render
			res.render("./pages/editsite", {loginState: req.session, siteInfo: domainCheck[0], skabeloner: skabelonCheck});

		}else {

			// Redir
			res.redirect("/login");

			// res.send(domainCheck);

		}

	}else {

		// Redirect
		res.redirect("/login");

	}

})

// Oprettelse af bruger
app.get("/opret-bruger", (req,res) => {

	// Render
	res.render("./pages/opretBruger", {loginState: req.session});

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

	if ("username" in req.body && "password" in req.body){

		// Post login params
		var username = mysql2.escape(req.body.username);
		var password = mysql2.escape(req.body.password);

		// Tjek om dette brugernavn findes
		var result = conn.query(`SELECT * FROM Users WHERE username = ${username} LIMIT 1`);

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

				console.log("Login Failed!", `User: ${username}`, `Pass: ${password}`, `Hash: ${passwordHash}`);

			}

		}else {
			
			// Opdater echo
			echo.success = false;
			echo.status = "Login not found!";
			echo.data = req.body;

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
	if ("username" in req.body && "password" in req.body){

		// Opret variabler
		var username = mysql2.escape(req.body.username);
		var password = mysql2.escape(req.body.password);

		// Log
		console.log(`New user request: username: ${username} - pass: ${password}`)

		// Hash password
		const salt = bcrypt.genSaltSync(saltRounds);
		const passwordHash = bcrypt.hashSync(password, salt);

		// Tjek om brugernavnet allerede findes i DB.
		var userCheck = conn.query(`SELECT * FROM Users WHERE username = ${username}`);

		if (!(userCheck.length > 0)) {

			// Opret bruger i DB
			var result = conn.query(`INSERT INTO Users (username, password) VALUES (${username}, "${passwordHash}")`);

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
		echo.data = req.body;

	}

	res.send(echo);

})
app.get("/removeUser", (req,res) => {
	// 
	let echo ={
		err: "",
		errCode: 0,
		success: false,
		status:"",
		data: {}
	}
	if(req.session.loggedIn){

		// Opret variabler
		let loginUser = mysql2.escape(req.session.username);
		let loginUserID = mysql2.escape(req.session.userID);

		// Mysql
		let result = conn.query(`DELETE FROM Sites WHERE user_id = ${loginUserID}`);
		let result2 = conn.query(`DELETE FROM Users WHERE id = ${loginUserID}`);

		// Opdater echo
		echo.data ={result, result2}
		echo.success= true;
		echo.status = "Delete user and users sites"

	}
	else{

		// Opdater echo
		echo.success= false;
		echo.err= "user not logged in";
		echo.errCode = 403;

	}

	// Send echo
	res.send(echo);

})
app.get("/logout",(req,res)=> {
	
	// Destroy session
	req.session.destroy();

	// Redir
	res.redirect("/")

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
		var loginUser = mysql2.escape(req.session.username);
		var loginUserID = mysql2.escape(req.session.userID);

		// MYSQL Query
		var result = conn.query(`SELECT * FROM Sites WHERE user_id = ${loginUserID}`);

		// Opdater echo
		echo.data = result;
		echo.success = true;
		echo.status = "Get all sites";

	}else {

		// Bruger er ikke logget ind
		echo.success = false;
		echo.err = "User not logged in!";
		echo.errCode = 403;
		echo.status = echo.err;

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

			// Opret variabler og escape string
			var name = mysql2.escape(req.body.name);
			var skabelon_id = mysql2.escape(req.body.skabelon_id);
			var contact_mail = mysql2.escape(req.body.contact_mail);
			var contact_phone = mysql2.escape(req.body.contact_phone);
			var contact_name = mysql2.escape(req.body.contact_name);
			var contact_address = mysql2.escape(req.body.contact_address);
			var text = mysql2.escape(req.body.text);
			var sub_domain = mysql2.escape(req.body.sub_domain);
			var site_id = mysql2.escape(req.body.site_id);
			var favicon = mysql2.escape(req.body.favicon);

			// Tjek om dette skableonID eksisterer
			var skabelonCheck = conn.query(`SELECT * FROM Skabeloner WHERE id = ${skabelon_id}`);

			if (skabelonCheck.length > 0) {
				
				// Denne skabelon eksisterer!

			}else {

				// Find den første skabelon
				var firstSkabelon = conn.query(`SELECT * FROM Skabeloner ORDER BY id ASC LIMIT 1`);

				// Opdater skabelon id
				skabelon_id = firstSkabelon[0].id;

			}

			// Url encode sub_domain
			sub_domain = sub_domain.replaceAll(" ", "-").toLowerCase();

			// Opret sub_domain som ikke er escaped der bruges til mkdir m.m
			var sub_domainNOTESCAPED = req.body.sub_domain.replaceAll(" ", "-").toLowerCase();

			// Alle vars er sat
			echo.success = true;
			echo.status = "Alle variabler fundet!";
			echo.data = pbody;

			// Tjek om der er blevet uploadet en fil
			if (!req.files) {
				
				// Opdater echo
				echo.success = false;
				echo.err = "No files were uploaded!";
				echo.status = echo.err;

				return res.send(echo);

			}

			// Upload af file
			var uploadPath;
			var favicon_file;

			// Definer filen
			favicon_file = req.files.favicon;
  			uploadPath = __dirname + '/public/Sites/' + sub_domainNOTESCAPED + '/' + favicon_file.name;

			// Tjek om mappen til sub-domænet eksisterer
			fs.access(`./public/Sites/${sub_domainNOTESCAPED}/`, function(error) {
				if (error) {
				
					// Opret mappen
					fs.mkdirSync(`./public/Sites/${sub_domainNOTESCAPED}/`)

				}

				// Flyt filen
				// Use the mv() method to place the file somewhere on your server
				favicon_file.mv(uploadPath, function(err) {
					if (err) {
						
						console.log(err);

						// Opdater echo
						echo.success = false;
						echo.status = err;
						echo.err = err;

						// return res.send(echo);

					}

					// Opdater echo
					echo.success = true;
					echo.status = "Favicon opdateret";

				});


			});

			// Tjek om sub_domain er unik
			var subCheck = conn.query(`SELECT * FROM Sites WHERE sub_domain = ${sub_domain}`);

			// tjek
			if (subCheck.length > 0) {

				// Side eksisterer allerede
				echo.success = false;
				echo.status = "This sub_domain already exists!";

			}else {

				// Opret ny site i mysql
				var result = conn.query(`INSERT INTO Sites (name, contact_mail, contact_phone, contact_name, contact_address, text, skabelon_id, user_id, sub_domain, favicon) VALUES (${name}, ${contact_mail}, ${contact_phone}, ${contact_name}, ${contact_address}, ${text}, ${skabelon_id}, ${req.session.userID}, ${sub_domain}, "/public/Sites/${req.body.sub_domain.replaceAll(" ", "-").toLowerCase()}/${favicon_file.name}")`);
				
				console.log("Results", result);

				// Opdater echo
				echo.success = true;
				echo.status = "Site oprettet: /s/" + sub_domainNOTESCAPED;

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
		echo.status = echo.err;

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

		// Opret variabler til login
		var loginUser = mysql2.escape(req.session.username);
		var loginUserID = mysql2.escape(req.session.userID);

		// Tjek om variabler er udfyldt
		if (req.session.userID && req.body.site_id) {

			// Opret variabler og escape
			var site_id = mysql2.escape(req.body.site_id);

			// Alle variabler er udfyldt
			// Tjek om userID og user_id i mysql stemmer overens
			var userCheck = conn.query(`SELECT * FROM Sites WHERE user_id = ${loginUserID} AND id = ${site_id}`);

			// If length
			if (userCheck.length > 0) {

				// Det hele stemmer overens
				// Fjern denne fra DB
				var deleteMysql = conn.query(`DELETE FROM Sites WHERE user_id = ${loginUserID} AND id = ${site_id}`);

				// Opdater echo
				echo.success = true;
				echo.status = `Site with id: ${site_id} has been deleted!`;
			
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

// Opdater site
app.post("/updateSite", (req,res) => {

	// Opret echo som sendes om svar til sidst
	var echo = {
		err: "",
		errCode: 0,
		success: false,
		status: "",
		data: ""
	}

	// Tjek om brugeren er logget ind.
	if (req.session.loggedIn) {

		// Opret login
		var loginUser = mysql2.escape(req.session.username);
		var loginUserID = mysql2.escape(req.session.userID);

		// Tjek om alle variabler er udfyldt
		if (req.session.userID && req.body.site_id && req.body.name && req.body.skabelon_id && req.body.contact_mail && req.body.contact_phone && req.body.contact_name && req.body.contact_address && req.body.text && req.body.sub_domain){

			// Alting er udfyldt
			// Opret variabler
			var name = mysql2.escape(req.body.name);
			var skabelon_id = mysql2.escape(req.body.skabelon_id);
			var contact_mail = mysql2.escape(req.body.contact_mail);
			var contact_phone = mysql2.escape(req.body.contact_phone);
			var contact_name = mysql2.escape(req.body.contact_name);
			var contact_address = mysql2.escape(req.body.contact_address);
			var text = mysql2.escape(req.body.text);
			var sub_domain = mysql2.escape(req.body.sub_domain);
			var site_id = mysql2.escape(req.body.site_id);

			// Tjek om dette skableonID eksisterer
			var skabelonCheck = conn.query(`SELECT * FROM Skabeloner WHERE id = ${skabelon_id}`);

			if (skabelonCheck.length > 0) {
				
				// Denne skabelon eksisterer!

			}else {

				// Find den første skabelon
				var firstSkabelon = conn.query(`SELECT * FROM Skabeloner ORDER BY id ASC LIMIT 1`);

				// Opdater skabelon id
				skabelon_id = firstSkabelon[0].id;

			}
			
			// Upload af file
			var uploadPath;
			var favicon_file;

			// Url encode sub_domain
			sub_domain = sub_domain.replaceAll(" ", "-").toLowerCase();

			// Opret sub_domain som bruges til mkdir m.m.
			var sub_domainNOTESCAPED = req.body.sub_domain.replaceAll(" ", "-").toLowerCase();
			
			// Tjek om denne hjemmeside tilhører denne bruger der er logget ind.
			var userCheck = conn.query(`SELECT * FROM Sites where id = ${site_id} AND user_id = ${loginUserID}`);

			// Tjek resultat
			if (userCheck.length > 0) {

				// Tjek om subdomænet er blevet ændret
				var domainChangeCheck = conn.query(`SELECT * FROM Sites where sub_domain = ${sub_domain} AND user_id = ${loginUserID}`);

				// Tjek resulstatet
				if (domainChangeCheck.length > 0) {

					// Tjek domænet allerede er i brug
					var domainUsedCheck = conn.query(`SELECT * FROM Sites where sub_domain = ${sub_domain} AND user_id != ${loginUserID}`)

					// Tjek resultatet
					if (domainUsedCheck.length > 0) {

						// Dette domæner er allerede i brug.
						echo.success = false;
						echo.err = "Sub-domain already in use.";
						echo.errCode = 100;

						return res.send(echo);

					}

				}

				// Opdater sql
				var updateSQL = conn.query(`UPDATE Sites SET name = ${name}, skabelon_id = ${skabelon_id}, contact_mail = ${contact_mail}, contact_phone = ${contact_phone}, contact_name = ${contact_name}, contact_address = ${contact_address}, sub_domain = ${sub_domain}, text = ${text} WHERE user_id = ${loginUserID} AND id = ${site_id}`);

				// Opdater echo
				echo.success = true;
				echo.status = "Site updated.";
				echo.data = updateSQL;

				// console.log("Favicon!", req.body);

				// Tjek om der er blevet uploadet en fil
				if (req.files) {

					// Definer filen
					favicon_file = req.files.favicon;
					uploadPath = __dirname + '/public/Sites/' + sub_domainNOTESCAPED + '/' + favicon_file.name;

					// Tjek om mappen til sub-domænet eksisterer
					fs.access(`${__dirname}/public/Sites/${sub_domainNOTESCAPED}/`, function(error) {
						if (error) {
						
							// Opret mappen
							fs.mkdirSync(`${__dirname}/public/Sites/${sub_domainNOTESCAPED}/`)

						}

					});

					// Flyt filen
					// Use the mv() method to place the file somewhere on your server
					favicon_file.mv(uploadPath, function(err) {
						if (err) {
							
							console.log(err);

							// Opdater echo
							echo.success = false;
							echo.status = err;
							echo.err = err;

							// return res.send(echo);

						}

						// Opret var til favicon placcering
						var faviconPlacement = mysql2.escape("/public/Sites/" + sub_domainNOTESCAPED + "/" + favicon_file.name);

						// Mysql
						var updateFavicon = conn.query(`UPDATE Sites SET favicon = ${faviconPlacement} WHERE user_id = ${loginUserID} AND id = ${site_id}`);

						// Opdater echo
						echo.success = true;
						echo.status = echo.status + " Favicon updated"

					});

				}

			}else {

				// Opdater echo
				echo.success = false;
				echo.status = "Sites does not exists or does not belong to you!";
				echo.err = echo.status;
				echo.errCode = 403;
				echo.data = userCheck;

			}

		}else {

			// Opdater echo
			echo.success = false;
			echo.status = "Not all dependencies have been filled"
			echo.data = [
				req.body,
				req.session
			];

			// Log
			console.log(echo.status, JSON.stringify(req.body), req.session);

		}

	}else {

		// Bruger ikke logget ind
		// Opdater echo
		echo.success = false;
		echo.err = "User not logged in!";
		echo.errCode = 403;
		echo.status = echo.err;

	}

	// Send echo
	res.send(echo);

})

// Render site
app.get("/s/:site/", (req,res) => {

	// Opret variabler
	var siteParam = mysql2.escape(req.params.site);

	// Tjek om denne site eksisterer
	var siteCheck = conn.query(`SELECT s.*, sk.placement FROM Sites s LEFT JOIN Skabeloner sk ON s.skabelon_id = sk.id WHERE s.sub_domain = ${siteParam} LIMIT 1`);

	// Tjek
	if (siteCheck.length > 0) {

		// Ny var med kun siteInfo
		var siteInfo = siteCheck[0];

		// Render med EJS
		res.render(`./skabeloner/${siteInfo.placement}`, {siteInfo: siteInfo});

	}else {

		/* res.redirect("/"); */

		// Opret variabler
		var err = `Denne side kunne desværre ikke findes: <i>${req.originalUrl}</i>`;
		var errCode = 404;

		// Render error
		res.render("./pages/error", {loginState: req.session, err: err, errCode: errCode});
		

	}

})

// Serve filer i public mappen
app.use("/public", express.static("public"));

// 404
app.use("*", (req,res) => {
	
	// Send 404
	var err = `Denne side kunne desværre ikke findes: <i>${req.originalUrl}</i>`;
	var errCode = 404;

	// Render error
	res.render("./pages/error", {loginState: req.session, err: err, errCode: errCode});

})

// Start express server
app.listen(port, () => console.log(`App started on port: ${port}!`))