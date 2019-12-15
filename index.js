
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 5000
const paginate = require('express-paginate');

const Pool = require('pg').Pool

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL);

 // This is how I setup the database locally. So... Local dev doesn't work anymore until
 // I mess with the environment variables more
//  const sequelize = new Sequelize('colorsapp', 'postgres', 'password', {
//      host: 'localhost',
//      dialect: 'postgres'
//  }, {
//      pool: {
//          max: 5,
//          min: 0,
//          acquire: 30000,
//          idle: 10000
//      }
//  });

//}

sequelize.authenticate()
.then(() => {
    console.log('Connection has been established via sequelize');
})
.catch(err => {
    console.error("unable to connect via sequelize", err);
});

/*This function prepares the SQL query for the 100 values. Since we're on a shared
database in production this isn't necessary. The codes probably not very good either but
I used it locally so figured i'd keep it here.*/
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
})


app.get('/colors', (req, res) => {
    Color.findAndCountAll({
        limit: req.query.limit,
        offset: req.skip,
        attributes: ['color_id', 'color_code']
    }).then(results => {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / req.query.limit);
        console.log(results.rows);
        res.render('colors', { title: "well", message: "hello colors", colors: results.rows, pageCount, itemCount, pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)})
    });
});




app.get('/', (req, res) => {
    Color.findAndCountAll({
        limit: req.query.limit,
        offset: req.skip,
        attributes: ['color_id', 'color_code']
    }).then(results => {
        const itemCount = results.count;
        const pageCount = Math.ceil(results.count / req.query.limit);
        console.log(results.rows);
        res.render('colors', { title: "well", message: "hello colors", colors: results.rows, pageCount, itemCount, pages: paginate.getArrayPages(req)(3, pageCount, req.query.page)})
    });

      /*I had an if statement here that would populate the database if the colors didn't exist. */
})

  app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })