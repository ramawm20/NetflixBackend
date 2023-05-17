
'use strict'
const express = require('express')
const cors = require('cors');
const server = express();
require('dotenv').config();
const API = process.env.APIkey;

const pg = require('pg');
server.use(express.json());


server.use(cors());
let PORT = 3007;
const axios = require('axios');


server.get('/', homeHandler)
server.post('/addMovie', addToFavorite)
server.get('/favMovies', getFavMovies)
server.get("/trending", trendingResult)
server.put('/ubdateMovie/:id', ubdateMovie)
server.delete('/deleteMovie/:id', deleteMovie)
server.get('*', defaultHandler)
server.use(errorHandler)

const client = new pg.Client("postgresql://localhost:5432/netflix")


function homeHandler(req, res) {
    res.status(200).send("Hello from the Home Route")
}


function defaultHandler(req, res) {
    res.status(404).send('page not found')
}


function trendingResult(req, res) {
    console.log("we have recieve req");
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${API}&language=en-US`
    axios.get(url)
        .then(result => {
            let r = result.data.results;

            let result2 = r.map(item => {
                return item;
            })
            res.send(result2)
        })
        .catch(error => {
            console.log("soryyyyyyyy something wrong");
            res.send(error)
        })
}

function addToFavorite(req, res) {
    console.log('We got fav Movie')
    console.log(req.body)
    const favMovie = req.body
    const sql = `INSERT INTO favMovies ( adult, id, original_language, original_title, overview, poster_path, comment )
    VALUES ($1,$2, $3, $4, $5, $6, $7);`
    const values = [favMovie.adult, favMovie.id, favMovie.original_language, favMovie.original_title, favMovie.overview, favMovie.poster_path, favMovie.comment];
    client.query(sql, values)
        .then(data => {
            res.send("The data has been added successfully");
        })
        .catch(error => {
            errorHandler(error, req, res)
        })
}

function getFavMovies(req, res) {
    console.log('we should render movies');
    const sql = `SELECT * FROM favMovies;`;
    client.query(sql)
        .then(data => {
            res.send(data.rows);
            console.log('data from DB', data.rows)
        }).catch((error) => {
            errorHandler(error, req, res)
        })
}
function deleteMovie(req, res) {
    console.log("movie deleted");
    const { id } = req.params;
    const sql = `DELETE FROM favMovies WHERE id=${id}`
    client.query(sql)
        .then((data) => {
            res.send(data)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })

}

function ubdateMovie(req, res) {
    const { id } = req.params;
    console.log(req.body);
    const sql = `UPDATE favMovies SET comment= $1 WHERE id=${id};`

    const { comment } = req.body;
    const values = [comment];

    client.query(sql, values)
        .then((data) => {
            res.send(data)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}



function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`I am ready.....Let's go on ${PORT}`)
        })
    }) 