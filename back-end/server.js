const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');
const port = process.env.PORT || 8000; // port server

// Create a connection pool to MariaDB
const pool = mariadb.createPool({
    host: 'localhost',       // Database host
    user: 'root',            // Database username
    database: 'React-ploclo',// Database name
    password: '',            // Database password
    port: '3308',            // Database port
    connectionLimit: 5       // Limit the number of connections in the pool
});

const table = 'data';
const app = express();
app.use(cors());
app.use(express.json());

// Test database connection
pool.getConnection()
    .then(conn => {
        console.log(`Connected to database with threadID: ${conn.threadId}`);
        conn.release(); // Release connection back to pool
    })
    .catch(err => {
        console.error('Error connecting to Database:', err);
    });

// API root route
app.get('/', (req, res) => {
    res.send('Server is working');
});

// API route to get data from database
app.get('/getdata', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const result = await conn.query(`SELECT * FROM ${table}`);
        res.json(result);
        conn.release();
    } catch (err) {
        res.status(500).send(err);
    }
});

// API route to insert data into database
app.post('/insert', async (req, res) => {
    const data_list = req.body;

    // Validate input data
    if (!data_list || !Array.isArray(data_list) || data_list.length === 0) {
        return res.status(400).json({
            message: "No data provided or data is not in correct format"
        });
    }

    const columns = Object.keys(data_list[0]).join(',');
    const placeholders = data_list.map(() => `(${Object.keys(data_list[0]).map(() => '?').join(',')})`).join(',');
    const data = data_list.reduce((acc, item) => acc.concat(Object.values(item)), []);

    const query = `
        INSERT INTO ${table} (${columns})
        VALUES ${placeholders}
    `;

    try {
        const conn = await pool.getConnection();
        await conn.query(query, data);
        res.status(201).json({
            message: 'Student data inserted successfully'
        });
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Database insertion failed', err
        });
    }
});

// API route to search data in database
// http://localhost:8000/search?column=id&value=3
app.get('/search', async (req, res) => {
    const data = req.query;

    if (!data) {
        return res.status(400).json({ message: "No data" });
    }

    const keys = Object.keys(data);
    const values = Object.values(data);

    const whereClause = keys.map(col => `${col} = ?`).join(' AND ');
    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(query, values);
        res.status(200).json(result);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Database searching failed'
        });
    }
});

// API route to delete data from database
// http://localhost:8000/delete?column=name&value=test2
app.delete('/delete', async (req, res) => {
    const data_select = req.query;

    if (!data_select) {
        return res.status(400).json({
            message: 'No data to delete'
        });
    }

    const keys = Object.keys(data_select);
    const values = Object.values(data_select);

    const whereClause = keys.map(col => `${col} = ?`).join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(query, values);
        res.status(200).json({
            message: 'Data deletion succeeded',
            affectedRows: result.affectedRows
        });
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Database deletion failed'
        });
    }
});

// API route to update data in database
// http://localhost:8000/update?column=id&value=1
app.put('/update', async (req, res) => {
    const data_select = req.query;
    const data_update = req.body;

    if (!data_select || !data_update) {
        return res.status(400).json({
            message: "No data provided"
        });
    }

    // Extract keys and values from the request data
    const keys_select = Object.keys(data_select);
    const values_select = Object.values(data_select);
    const keys_update = Object.keys(data_update);
    const values_update = Object.values(data_update);

    // Create Set clause
    const setClause = keys_update.map(key => `${key} = ?`).join(', ');
    // Create WHERE clause
    const whereClause = keys_select.map(col => `${col} = ?`).join(' AND ');
    // SQL query
    const query = `
        UPDATE ${table}
        SET ${setClause}
        WHERE ${whereClause}
    `;
    // Concatenate the values for the query parameters
    const values = [...values_update, ...values_select];

    try {
        const conn = await pool.getConnection();
        const result = await conn.query(query, values);
        res.status(200).json({
            message: 'Data updated successfully',
            affectedRows: result.affectedRows
        });
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Database update failed', err
        });
    }
});

// API route to handle login
app.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const conn = await pool.getConnection();

        // Check if the email exists in the database
        const results = await conn.query('SELECT role FROM role WHERE email = ?', [email]);

        if (results.length > 0) {
            // If the email exists, return the role
            res.json({ role: results[0].role });
        } else {
            // If the email doesn't exist, insert a new user with a default role
            const defaultRole = 'user';
            await conn.query('INSERT INTO role (email, role) VALUES (?, ?)', [email, defaultRole]);
            res.json({ role: defaultRole });
        }
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
