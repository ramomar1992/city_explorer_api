const PORT = 3000; // server port
const express = require('express'); // importing express
const cors = require('cors'); // importing cors
// const {
//     response,
//     request
// } = require('express');
const app = express(); // initializing express and save it into variable
app.use(cors()); // populate express with cors routs
// constructor function for the location response
function LocationObj(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
}

app.get('/location', handleLocation); //location route
// implementing location handler
function handleLocation(req, res) {
    //import data file from the source
    let getLocation = require('./data/location.json');
    //constructing the location object
    let resp = new LocationObj(req.query.city, getLocation[0].display_name, getLocation[0].lat, getLocation[0].lon);
    console.log(resp);
    //return the response
    res.send(resp);
}

// app.get('/')

// run the server
app.listen(PORT, () => console.log("running server at port", PORT));