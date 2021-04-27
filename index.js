
// Require
const express = require("express");

// Express
const app = express();
const port = 3050;

// Express sessions
const session = require("express-session");

// Opstart sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: '!Password1!',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
}))

// Mysql login info
// Username: quickDB
// Password: !Password1!
// Server: famas.ml
// Database: quicksite

app.get("/", (req,res) =>{

	// Tjek om brugeren er logget ind
	if (!req.session.isLoggedIn) {
		res.send("Du er ikke logget ind!");
	}else {
		res.send("This is a quickSite API endpoint!" + req.query.peter);
	}

})

// Test
app.get("/username/:username/hash/:password/", (req,res) => {

	// Opret vars
	var username = req.params.username;
	var password = req.params.password;

	res.send(username + "-" + password);

})

// Start express server
app.listen(port, () => console.log("App started!"));