
// Require
const express = require("express");
let username; 
let passwordhash;
const app = express();
const port = 3050;
const routepath = "/username/:username/hash/:password";

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

	//res.send("This is a quickSite API endpoint!");
	res.send(req.query.prams);
	if(req.query.username||req.query.passwordhash)
	res.redirect("Loginsite", token)

})



// Start express server
app.listen(port, () => console.log("App started!"))