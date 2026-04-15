const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'aruna',   
    database: 'eventdb'
});

db.connect((err) => {
    if (err) {
        console.log("Error connecting to MySQL:", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// Home route
app.get('/', (req, res) => {
    res.send("Server + MySQL Connected!");
});

app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/register', (req, res) => {
    const { regno, name, events } = req.body;

    if (!events) {
        return res.send("Error: Please select at least one event");
    }

    let eventList = events;

    if (!Array.isArray(eventList)) {
        eventList = [eventList];
    }

    if (eventList.length > 3) {
        return res.send("Error: Maximum 3 events allowed");
    }

    const eventString = eventList.join(", ");

    const sql = "INSERT INTO registrations (regno, name, events) VALUES (?, ?, ?)";

    db.query(sql, [regno, name, eventString], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send("Error: Register number already exists");
            }
            return res.send("Database error");
        }

        res.send("Registration successful!");
    });
});

app.get('/search', (req, res) => {
    res.sendFile(__dirname + '/search.html');
});

app.post('/search', (req, res) => {
    const regno = req.body.regno;

    const sql = "SELECT * FROM registrations WHERE regno = ?";

    db.query(sql, [regno], (err, results) => {
        if (err) {
            return res.send("Database error");
        }

        if (results.length === 0) {
            return res.send("No record found");
        }

        const data = results[0];

        res.send(`
            <h2>Registration Details</h2>
            Register Number: ${data.regno} <br>
            Name: ${data.name} <br>
            Events: ${data.events}
        `);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});