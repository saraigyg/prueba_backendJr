const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

//create de connection to the database
const pool = mysql.createPool({
  host: 'precios-1.c0f6dm2ucnlg.us-east-2.rds.amazonaws.com',
  user: 'candidatoPrueba',
  password: 'gaspre21.M',
  database: 'prueba',
});


//endpoint to retrieve the brands name
app.get('/brands/:id', (req, res) => {
    const id = req.params.id;

    pool.getConnection((error, connection) => {
        if (error) {
          console.error('Error getting database connection:', error);
          res.status(500).send('Internal server error');
          return;
        }
    
        connection.query('SELECT name FROM brands WHERE id IN (SELECT id FROM stations_brands WHERE id = ?)', [id], (error, results, fields) => {
          if (error) {
            console.error('Error querying database:', error);
            res.status(500).send('Internal server error');
            connection.release();
            return;
          }

        const brandNames = results.map(result => result.name);
        res.json(brandNames);
        connection.release();
    });
  });
});



//endpoint to retrieve the distance

app.get('/distance', (req, res) => {
    const { station1_id, station2_id } = req.query;
    pool.query(
      `SELECT ST_Distance_Sphere(
          point(s1.location_x, s1.location_y),
          point(s2.location_x, s2.location_y)
        ) as distance
        FROM stations s1
        JOIN stations_competitors sc ON s1.id = sc.station_id
        JOIN stations s2 ON sc.competitor_id = s2.id
        WHERE s1.id = ? AND s2.id = ?;`,
      [station1_id, station2_id],
      (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          res.status(500).send('Internal server error');
          return;
        }
        const distance = results[0].distance;
        res.json({ distance });
      }
    );
  });

  //endpoint to retrieve the price per product

  app.get('/prices', (req, res) => {
    const query = `
      SELECT prices.value, prices.product
      FROM prices
      INNER JOIN stations ON prices.cre_id = stations.cre_id
    `;
  
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query: ', error);
        res.status(500).send('Error executing query');
        return;
      }
      res.json(results);
    });
  });

  //endpoint to retrieve the name of the brand
  
  app.get('/brand', (req, res) => {
    const query = `
      SELECT stations.name
      FROM stations
      INNER JOIN stations ON prices.cre_id = stations.cre_id
    `;
  
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query: ', error);
        res.status(500).send('Error executing query');
        return;
      }
      res.json(results);
    });
  });

  //endpoint to retrieve the difference of prices between two stations
  app.get('/diffPrices', (req, res) => {
  const { station1_price, station2_price } = req.query;
  pool.query(
  `SELECT s1.name AS station1, s2.name AS station2, ABS(p1.price - p2.price) AS price_diff
   FROM prices p1
   JOIN stations s1 ON p1.cre_id = s1.id
   JOIN prices p2 ON p1.product_id = p2.product_id AND p1.cre_id != p2.cre_id
   JOIN stations s2 ON p2.cre_id = s2.id
   WHERE p1.cre_id = ?
   ORDER BY price_diff;`,
  [station1_price, station2_price],
  (error, results) => {
    if (error) {
      console.error('Error retrieving price difference:', error);
      res.status(500).send('Internal server error');
      return;
    }
    console.log('Price difference:', results);
  }
)});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
    });




