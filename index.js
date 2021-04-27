
// Require
const express = require("express");
let username; 
let passwordhash;
const app = express();
const port = 3050;
const routepath = "/username/:username/hash/:password";

app.get("/", (req,res) =>{

	//res.send("This is a quickSite API endpoint!");
	res.send(req.query.prams);
	if(req.query.username||req.query.passwordhash)
	res.redirect("Loginsite", token)

})



// Start express server
app.listen(port, () => console.log("App started!"))