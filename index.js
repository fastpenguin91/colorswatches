
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 5000
//const db = require('./queries')
const paginate = require('express-paginate');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'colorsapp',
  password: 'password',
  port: 5432,
})

const Sequelize = require('sequelize');

if (process.env.DATABASE_URL) { // production
    console.log("in production database setup!");
  //const sequelize = new Sequelize('colorsapp', 'postgres', 'password', {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
//      port: match[4],
//      host: match[3],
  }, {
      pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
      }
  });

} else { // local
    console.log("setting up local database");
  const sequelize = new Sequelize('colorsapp', 'postgres', 'password', {
      host: 'localhost',
      dialect: 'postgres'
  }, {
      pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
      }
  });

}

sequelize.authenticate()
.then(() => {
    console.log('Connection has been established via sequelize');
})
.catch(err => {
    console.error("unable to connect via sequelize", err);
});


function prepareQuery(){

  let finalQuery = 'INSERT INTO colors (color_code) VALUES ';

  let finalArr = [];
  let potentialVals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  let first;
  let second;
  let third;
  let fourth;
  let fifth;
  let sixth;
            
  for (let i=0; i < 100; i++) {
    first = potentialVals[Math.floor(Math.random() * potentialVals.length)];
    second = potentialVals[Math.floor(Math.random() * potentialVals.length)];
    third = potentialVals[Math.floor(Math.random() * potentialVals.length)];
    fourth = potentialVals[Math.floor(Math.random() * potentialVals.length)];
    fifth = potentialVals[Math.floor(Math.random() * potentialVals.length)];
    sixth = potentialVals[Math.floor(Math.random() * potentialVals.length)];
    finalArr.push(first + second + third + fourth + fifth + sixth);
  }
            
  finalArr.forEach(function(elem, index){
    if (index < (finalArr.length - 1)) {
      finalQuery += "('" + elem + "'),";
    } else {
      finalQuery += "('" + elem + "');";
    }
  });

  return finalQuery;

}




app.set('views', './views')
app.set('view engine', 'pug')
app.use(paginate.middleware(10,50));
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const Model = Sequelize.Model;
class Color extends Model {}

Color.init({
    color_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    color_code: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'color'
});

app.get('/colors/:color_id', (req, res) => {
    Color.findOne({
        attributes: ['color_id', 'color_code'],
        where: {color_id: req.params.color_id}
    }).then(results => {
        console.log("results for specific color: ");
        console.log(results.dataValues);
        console.log(results);
        res.render('color', {color_code: results.dataValues.color_code, color_id: results.dataValues.color_id});
    })
    //res.send(req.params);
})


app.get('/colors', (req, res) => {
    /*Color.findAll({
        attributes: ['color_id', 'color_code']
    }).then(colors => {
        console.log("All colors: ", JSON.stringify(colors, null, 4));
    });*/
    Color.findAndCountAll({
        limit: req.query.limit,
        offset: req.skip,
        attributes: ['color_id', 'color_code']
    }).then(results => {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / req.query.limit);
        console.log(results.rows);
        res.render('colors', { title: "well", message: "hello colors", colors: results.rows, pageCount, itemCount, pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)})
    //});
//        console.log("All colors: ", JSON.stringify(colors, null, 4));
    });


    //res.send("sequeliiiiiize");
});




app.get('/', (request, response) => {

    pool.query('SELECT * FROM colors ORDER BY color_id ASC', (error, results) => {
      if (error) {
        throw error
      }

//    response.json({ info: 'Node.js, Express, and Postgres API' })
      if (results.rows.length < 100) {
        console.log("indenting sucks in VSCode!");
        let theQuery = prepareQuery();
        console.log(theQuery);

        pool.query(theQuery, (error, results) => {
            if (error) {
                throw error
            }
        })

      } else {
        console.log("100 rows or more");
      }

    });
    response.render('index', { title: 'Hey', message: 'Hello there!' })
})




/*app.get('/colors', (req, res) => {
    console.log("hiiiii");

    pool.query('SELECT * FROM colors ORDER BY color_id ASC', (error, results) => {
      if (error) {
        throw error
      }

      //let limitedResults = results.limit(req.query.limit).skip(req.skip).lean().exec()
      //console.log("imited results");
      //console.log(limitedResults);

      let pageCount = Math.ceil(results.rows.length / req.query.limit);
      let itemCount = results.rows.length;
      //console.log("page count...");
      //console.log(pageCount);
      //console.log(typeof pageCount);
      //console.log(paginate.getArrayPages(req)(10, pageCount, req.query.page));

//      return results.rows;
      //response.status(200).json(results.rows)
    res.render('colors', { title: "well", message: "hello colors", colors: results.rows, pageCount, itemCount, pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)})
    });

//    res.render('colors', { title: "well", message: "hello colors", colors: "chaa"})
})*/

  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })