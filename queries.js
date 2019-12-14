

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'colorsapp',
  password: 'password',
  port: 5432,
})

const getColors = (request, response) => {
    pool.query('SELECT * FROM colors ORDER BY color_id ASC', (error, results) => {
      if (error) {
        throw error
      }
      console.log(results.rows);
      return results.rows;
      //response.status(200).json(results.rows)
    })
  }

  module.exports = {
    getColors,
  }

















//  -------

/*
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'colorsapp',
  password: 'password',
  port: 5432,
})

const getColors = (request, response) => {
    pool.query('SELECT * FROM colors ORDER BY color_id ASC', (error, results) => {
      if (error) {
        throw error
      }
      return results.rows;
      //response.status(200).json(results.rows)
    })
  }

  module.exports = {
    getColors,
  }

*/



///////  index.s  
  // ---------
/*
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const db = require('./queries')

//const Pool = require('pg').Pool



app.set('views', './views')
app.set('view engine', 'pug')
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
//    response.json({ info: 'Node.js, Express, and Postgres API' })
    response.render('index', { title: 'Hey', message: 'Hello there!' })
})

app.get('/colors', (req, res) => {
    console.log("hiiiii");
    console.log(db.getColors());
    res.render('colors', { title: "well", message: "hello colors", colors: db.getColors})
})

  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  }) */