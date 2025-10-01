// db.js

const { Pool } = require('pg');


// Create a new Pool instance for the database connection.
// This is the recommended way to connect to a PostgreSQL database
// as it manages a pool of connections for you.
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UPujmTs74beq@ep-broad-meadow-adn4i50l-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// A simple test function to verify the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Database connected successfully');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};