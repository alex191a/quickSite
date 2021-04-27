
// Require
const express = require("express");
const mysql = require('mysql')

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

const db = 'quicksite';
const dbusername = 'quickDB';
const dbPassword = '!Password1!';
const server = 'famas.ml'
const conn = mysql.createConnection({
	host: server,
	user: dbusername,
	password: dbPassword,
	database: db
})

app.get("/", (req,res) =>{
conn.connect()
	//res.send("This is a quickSite API endpoint!");
	let token
	let username = "undefined"
	if(req.query.username){
		username = req.query.username 
	}
	let authenticate;
	authenticate= conn.query(`SELECT password FROM Users WHERE Users.username = "${username}"`,function (error, results){
		if(error) throw error;
	 }).RowDataPacket.toString()
	 
	res.send (authenticate);
	if(req.query.passwordhash==authenticate){
		conn.query(`SELECT id FROM Users WHERE username = "${username}"`,function (error, results){
			if(error) throw error;
			token = results[0]
		});
	}
	else{
		//res.redirect("/");
		res.send("ass")
	}
	if(token){
		res.send("jonas er Ass")
		//res.redirect("yoursite.js/"+token);
	}

	
})



// Start express server
app.listen(port, () => console.log("App started!"))