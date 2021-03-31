'use strict';
require("dotenv").config();
const PORT = process.env.PORT; // server port
const express = require('express'); // importing express
const cors = require('cors'); // importing cors
const pg = require('pg');
const superagent = require('superagent'); // importing superagent package 
const app = express(); // initializing express and save it into variable
app.use(cors()); // populate express with cors routs
const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
}); // initialize the pg database with the url of the database
client.on('error', err => console.log("PG PROBLEM!!!")); // handle DB errors

// Cashing Locations from sql
let citiesLocationData = {};
client.query('select * from locations').then(data => {
    data.rows.forEach(elem => {
        citiesLocationData[elem.search_query] = elem;
    });
});

// constructor function for the location response
class LocationObj {
    constructor(search_query, formatted_query, latitude, longitude) {
        this.search_query = search_query;
        this.formatted_query = formatted_query;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

app.get('/location', handleLocation); //location route
app.get('/weather', handleWeather); //weather route
app.get('/parks', handleParks); //weather route
app.get('/movies', handleMovies);
app.get('/yelp', handleYelp);


// implementing location handler
function handleLocation(req, res) {
    // The city queried from the user
    let query = req.query.city;
    //import data file from the api if nor exsists in the cash
    if (!citiesLocationData[query]) {
        let SQL = 'INSERT INTO locations (search_query, formatted_query,latitude,longitude) VALUES($1, $2, $3, $4) RETURNING *';
        let API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${query}&format=json`;
        superagent.get(API).then(data => {
            //constructing the location object
            let newLocation = new LocationObj(query,
                data.body[0].display_name,
                data.body[0].lat,
                data.body[0].lon);
            let values = [newLocation.search_query,
                newLocation.formatted_query,
                newLocation.latitude,
                newLocation.longitude
            ];
            client.query(SQL, values).then(ret => {
                // Cashing the result 
                citiesLocationData[query] = newLocation;

                //return the response
                res.send(newLocation);
            });

        }).catch(er => {
            console.log("Something Went Wrong");
        });
        // if the city name exsists in the cashed variable
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
    let SQL = 'INSERT INTO weathers (search_query,forecast ,time) VALUES($1, $2, $3) RETURNING *';
    let SQL2 = 'SELECT * FROM weathers WHERE search_query=$1';
    client.query(SQL2, [query]).then(data => {
        if (data.rowCount == 0) {
            superagent.get(`https://api.weatherbit.io/v2.0/forecast/daily?city=${query}&country=US&key=${process.env.WEATHER_API_KEY}`).then(data => {
                // saving weather data inside the array

                data.body.data.forEach(ent => {
                    client.query(SQL, [query,
                        ent.weather.description,
                        ent.valid_date
                    ]);
                });

                client.query(SQL2, [query]).then(data => {
                    res.send(data.rows);
                });
            }).catch(er => {
                console.log("Something Went Wrong");
            });
        } else {
            res.send(data.rows);
        }
    });
}
// if not there getting the data from the source


// return the response


// implementing parks handler callback
function handleParks(req, res) {
    // The city queried from the user
    let query = req.query.search_query;
    let SQL = 'INSERT INTO parks (search_query,name,address ,fee,description,url) VALUES($1, $2, $3, $4, $5,$6) RETURNING *';

    //check if the data already exists or not
    client.query('SELECT * FROM parks WHERE search_query=$1', [query]).then(data => {
        if (data.rowCount == 0) {
            superagent.get(`https://developer.nps.gov/api/v1/parks?q=${query}&api_key=${process.env.PARKS_API_KEY}`).then(data => { // saving weather data inside the array
                data.body.data.slice(0, 10).forEach(ent => {
                    client.query(SQL, [query,
                        ent.fullName,
                        Object.values(ent.addresses[0]).join(','),
                        (ent.entranceFees[0]) ? ent.entranceFees[0].cost : 0.0,
                        ent.description,
                        ent.url
                    ]);
                });

                client.query('SELECT * FROM parks WHERE search_query=$1', [query]).then(data => {
                    res.send(data.rows);
                });
            }).catch(er => {
                console.log("Something Went Wrong");
            });
        } else {
            res.send(data.rows.slice(0, 10));
        }
    });
}

function handleMovies(req, res) {
    const query = req.query.search_query;
    let SQL2 = 'INSERT INTO movies (search_query,title,overview ,average_votes,total_votes,image_url,popularity,released_on) VALUES($1, $2, $3, $4, $5,$6,$7,$8) RETURNING *';
    let SQL = 'SELECT * FROM movies WHERE search_query=$1';
    client.query(SQL, [query]).then(data => {
        if (data.rowCount == 0) {
            superagent.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${query}`).then(data2 => {
                data2.body.results.slice(0, 20).forEach(elem => {
                    client.query(SQL2, [query,
                        elem.title,
                        elem.overview,
                        elem.vote_average,
                        elem.vote_count,
                        `https://image.tmdb.org/t/p/w500${elem.poster_path}`,
                        elem.popularity,
                        elem.release_date
                    ]);
                });
                client.query('SELECT * FROM movies WHERE search_query=$1', [query]).then(data => {
                    res.send(data.rows);
                });
            }).catch(er => {
                console.log("Something Went Wrong");
            });
        } else {
            res.send(data.rows.slice(0, 20));
        }
    });
}

function handleYelp(req, res) {
    let query = req.query.search_query;
    let page = req.query.page;
    console.log(req.query);
    let SQL = 'INSERT INTO restaurents (search_query,name,image_url ,price,rating,url) VALUES($1, $2, $3, $4, $5,$6) RETURNING *';

    //check if the data already exists or not
    client.query('SELECT * FROM restaurents WHERE search_query=$1', [query]).then(data => {
        if (data.rowCount == 0) {
            superagent.get(`https://api.yelp.com/v3/businesses/search?location=${query}&limit=50`)
                .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
                .then(data2 => { // saving weather data inside the array
                    data2.body.businesses.forEach(ent => {
                        client.query(SQL, [query,
                            ent.name,
                            ent.image_url,
                            ent.price,
                            ent.rating,
                            ent.url
                        ]);
                    });

                    client.query(`SELECT * FROM restaurents WHERE search_query=$1 Limit ${5*page} `, [query]).then(data => {
                        res.send(data.rows);
                    });
                }).catch(er => {
                    console.log("Something Went Wrong");
                });
        } else {
            res.send(data.rows.slice(((page - 1) * 5), 5 * page));
        }
    });
}
// run the server afther the DB is loaded
client.connect().then(() => {
    console.log("connected");
    app.listen(PORT, () => console.log(`App is running on ${PORT}`));
});