const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client
const port = process.env.port || 8000;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres', // Change to your PostgreSQL username
    database: 'PLOCLO',
    password: 'Postgres',     // Change to your PostgreSQL password
    port: 5432        // PostgreSQL default port
});

const table = 'Data';

const app = express();
app.use(cors());
app.use(express.json());

// Check database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error(`Error connecting to Database: ${err.stack}`);
    } else {
        console.log('Connected to PostgreSQL database');
        release();
    }
});

// API to test server
app.get('/', (req, res) => {
    res.send('Server is working');
});

// Get data from the database
app.get('/getdata', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM ${table}`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Insert data
app.post('/insert', async (req, res) => {
    const data_list = req.body;

    if (!data_list || !Array.isArray(data_list) || data_list.length === 0) {
        return res.status(400).json({ message: "No data provided or data is not in correct format" });
    }

    const columns = Object.keys(data_list[0]).join(',');
    const placeholders = data_list.map((_, i) =>
        `(${Object.keys(data_list[0]).map((_, j) => `$${i * Object.keys(data_list[0]).length + j + 1}`).join(', ')})`
    ).join(',');
    const data = data_list.reduce((acc, item) => acc.concat(Object.values(item)), []);

    const query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders} RETURNING *`;

    try {
        const result = await pool.query(query, data);
        res.status(201).json({ message: 'Data inserted successfully', data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Database insertion failed', error: err });
    }
});

// Search data
app.get('/search', async (req, res) => {
    const data = req.query;

    if (!data) {
        return res.status(400).json({ message: "No data" });
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    const whereClause = keys.map((col, i) => `${col} = $${i + 1}`).join(' AND ');

    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;

    try {
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Database search failed', error: err });
    }
});

// Delete data
app.delete('/delete', async (req, res) => {
    const data_select = req.query;

    if (!data_select) {
        return res.status(400).json({ message: 'No data to delete' });
    }

    const keys = Object.keys(data_select);
    const values = Object.values(data_select);
    const whereClause = keys.map((col, i) => `${col} = $${i + 1}`).join(' AND ');

    const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;

    try {
        const result = await pool.query(query, values);
        res.status(200).json({ message: 'Deletion succeeded', affectedRows: result.rowCount });
    } catch (err) {
        res.status(500).json({ message: 'Database deletion failed', error: err });
    }
});

// Update data
app.put('/update', async (req, res) => {
    const data_select = req.query;
    const data_update = req.body;

    if (!data_select || !data_update) {
        return res.status(400).json({ message: "No data provided" });
    }

    const keys_select = Object.keys(data_select);
    const values_select = Object.values(data_select);
    const keys_update = Object.keys(data_update);
    const values_update = Object.values(data_update);

    const setClause = keys_update.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = keys_select.map((col, i) => `${col} = $${i + 1 + values_update.length}`).join(' AND ');

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;

    const values = [...values_update, ...values_select];

    try {
        const result = await pool.query(query, values);
        res.status(200).json({ message: 'Data updated successfully', affectedRows: result.rowCount });
    } catch (err) {
        res.status(500).json({ message: 'Database update failed', error: err });
    }
});

// Login and role management
app.post('/login', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await pool.query('SELECT role FROM role WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            res.json({ role: result.rows[0].role });
        } else {
            const defaultRole = 'user';
            await pool.query('INSERT INTO role (email, role) VALUES ($1, $2)', [email, defaultRole]);
            res.json({ role: defaultRole });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
