'use strict';

const express = require('express')
const app = express()
require('dotenv').config({ path: '.env' })

app.use(express.static(__dirname + "/src"));
app.use(express.static(__dirname + "/src/app.js"));

// All routes other than above will go to index.html
app.get("*", (req, res) => {
	res.sendFile(__dirname + "/src/index.html");
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const key = process.env.PROJECT_API_KEY;

module.exports = { key }