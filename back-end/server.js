const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const port = process.env.port || 8000;
//const port = 8000; // port sever

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'React-ploclo',
    password:'',
    port:'3308'
});

const table ='data';

var app = express();
app.use(cors());
app.use(express.json());

connection.connect((err) =>{
    if(err) {
        console.error(`Error onnecting to Database :${err}`);
        return;
    }
    console.log(`Connected to database with threadID : ${connection.threadId}`);

});

//API
app.get('/',(req, res) => {
    res.send('Server is working');
});

//api คุยกับ DB
app.get('/getdata', async (req ,res)=>{
    connection.query(`SELECT * FROM ${table}`,(err, result) =>{
        if(err){
            res.status(500).send(err);
        }else {
            res.json(result);
        }
    });
});

//insert // http://localhost:8000/insert
app.post('/insert',async (req,res )=>{
    const data_list = req.body;

    if(!data_list || !Array.isArray(data_list) ||data_list.length === 0 ){
        return res.status(400).json({
            message: "No  data provided or data is not in correct format"
        });
    }

    const columns = Object.keys(data_list[0]).join(',');
    const placeholders = data_list.map(()=> `(${Object.keys(data_list[0]).map(()=>'?').join(',')})`).join(',');
    const data =data_list.reduce((acc,item)=>acc.concat(Object.values(item)),[]);

    const query =`
    INSERT INTO ${table} (${columns})
    VALUES ${placeholders}
    `;

    connection.query(query, data, (err,result) =>{
        if (err) {
            console.error(err);
            return res.status(500).json({
                message:'Database insertion failed'+err
            });
        }

        res.status(201).json({
            message:'Student data inserted successfully'
        });
    });
});

//query
// http://localhost:8000/search?column=id&value=3
app.get('/search', async(req,res)=> {
    const data =req.query;

    if (!data){
        return res.status(400).json({message: " No data"});

    }

    keys = Object.keys(data);
    values = Object.values(data);

    const whereClause = keys.map(col => `${col} = ?`).join(' AND ');
    const query =` SELECT * FROM ${table} WHERE ${whereClause} `;

    connection.query(query, values, (err,result) =>{
        if(err){
            console.error(err);
            return res.status(500).json({
                message:'Database seaching failed'
            });
        }
        res.status(200).json(result);
    });
});
//Delete
// http://localhost:8000/delete?column=name&value=test2
app.delete('/delete',async (req,res)=>{
    const data_select = req.query;

    if(!data_select){
        return res.status(400).json({
            message:'Database seaching failed'
        });
    }

    keys = Object.keys(data_select);
    values = Object.values(data_select);

    const whereClause = keys.map(col=>`${col}=? `).join('AND ');
    const query =`DELETE FROM ${table} WHERE ${whereClause} `;

    connection.query(query, values, (err, result)=>{
        if(err){
            console.error(err);
            return res.status(500).json({
                message:'database deletion failed'
            });
        }
        res.status(200).json({
            message: 'Delete deletion succeded',
            affctedRows:result.affctedRows
        });
    });
});


//UPDATE
// http://localhost:8000/update?column=id&value=1
app.put('/update', async (req, res) => {
    const data_select=req.query;
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

    //Create Set clause
    const setClause = keys_update.map(key => `${key} = ?`).join(', ');
    //Create WHERE clause
    const whereClause = keys_select.map(col => `${col} = ?`).join(' AND ');
    //SQL query
    const query=`
        UPDATE Data
        SET ${setClause}
        WHERE ${whereClause}
    `;
       // Concatenate the values for the query parameters
       const values = [...values_update, ...values_select];

    connection.query(query, values, (err, result) =>{
        if (err){
            return res.status(500).json({
                message:'Database updation failed ',err
            });
        }
        res.status(200).json({
            message: 'Data updated successfully',
            affctedRows: result.affctedRows
        });
    });
});


app.post('/login', (req, res) => {
    const { email } = req.body;

    // ตรวจสอบว่า email มีอยู่ในฐานข้อมูลหรือไม่
    connection.query('SELECT role FROM role WHERE email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (results.length > 0) {
            // ถ้ามี email นี้อยู่ในฐานข้อมูลให้ส่ง role กลับไป
            res.json({ role: results[0].role });
        } else {
            // ถ้าไม่มี email นี้ ให้สร้าง role ใหม่ด้วย default role
            const defaultRole = 'user';
            connection.query('INSERT INTO role (email, role) VALUES (?, ?)', [email, defaultRole], (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                res.json({ role: defaultRole });
            });
        }
    });
});

app.listen(port,() => {
    console.log(`Server is runging on http://localhost:${port}`);
})