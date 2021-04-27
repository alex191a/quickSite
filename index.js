
// Require
const express = require("express");

const app = express();
const port = 3050;

app.get("/", (req,res) =>{

	res.send("This is a quickSite API endpoint!");

})

// Start express server
app.listen(port, () => console.log("App started!"));