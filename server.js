'use strict';
require("dotenv").config();
const PORT = process.env.PORT; // server port
const express = require('express'); // importing express
const cors = require('cors'); // importing cors
const superagent = require('superagent'); // importing superagent package 
const app = express(); // initializing express and save it into variable
app.use(cors()); // populate express with cors routs

// creating an object that holds all data from the apis
let citiesWeatherData = {};
let citiesLocationData = {};
let citiesParksData = {};
// constructor function for the location response
class LocationObj {
    constructor(search_query, formatted_query, latitude, longitude) {
        this.search_query = search_query;
        this.formatted_query = formatted_query;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
//constructor function for the weather object
class WeatherObj {
    constructor(forecast, time) {
        this.forecast = forecast;
        this.time = time;
    }
}
//constructor function for the parks object
class ParksObj {
    constructor(name, address, fee, description, url) {
        this.name = name;
        this.address = address;
        this.fee = fee;
        this.description = description;
        this.url = url;
    }
}
app.get('/location', handleLocation); //location route
app.get('/weather', handleWeather); //weather route
app.get('/parks', handleParks); //weather route
// implementing location handler
function handleLocation(req, res) {
    // The city queried from the user
    let query = req.query.city;
    //import data file from the source
    if (!citiesLocationData[query]) {
        superagent.get(`https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${query}&format=json`).then(data => {
            //constructing the location object
            citiesLocationData[query] = new LocationObj(query, data.body[0].display_name, data.body[0].lat, data.body[0].lon);
            //return the response
            res.send(citiesLocationData[query]);
        });
    } else {
        //return the response
        res.send(citiesLocationData[query]);

    }
}

//implementing weather handler
function handleWeather(req, res) {
    // The city queried from the user
    let query = req.query.search_query;
    // check if it is not already exist in the server local memory, fitch the API
    if (!citiesWeatherData[query]) {
        // if not there getting the data from the source
        superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${query}&country=US&key=${process.env.WEATHER_API_KEY}`).then(data => {
            // saving weather data inside the array
            citiesWeatherData[query] = data.body.data.map(ent => {
                let obj = new WeatherObj(ent.weather.description, ent.valid_date);
                return obj;
            });
            res.send(citiesWeatherData[query]);
        });
    } else {
        res.send(citiesWeatherData[query]);
    }
    // return the response
}

// implementing parks handler callback
function handleParks(req, res) {
    // The city queried from the user
    let query = req.query.search_query;
    //check if the data already exists or not
    if (!citiesParksData[query]) {
        // if not there get the data from the source
        superagent.get(`https://developer.nps.gov/api/v1/parks?parkCode=${query}&api_key=${process.env.PARKS_API_KEY}`).then(data => {
            let info = data.body.data.slice(0, 11);

            let obj = info.map(elem => new ParksObj(elem.fullName, Object.values(elem.addresses[0]).join(','), elem.entranceFees[0].cost, elem.description, elem.url));
            // return the response
            citiesParksData[query] = obj;
            res.send(citiesParksData[query]);
        });
    } else {
        res.send(citiesParksData[query]);
    }
}

// run the server
app.listen(PORT, () => console.log("running server at port", PORT));