const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = "eventdb";

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
connectDB();


// ---------------- ROUTES ---------------- //

// Home route
app.get('/', (req, res) => {
    res.send("Server + MongoDB Connected!");
});


// Show registration form
app.get('/form', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// Handle registration
app.post('/register', async (req, res) => {
    const { regno, name, events } = req.body;

    const db = client.db(dbName);
    const collection = db.collection("registrations");

    let eventList = events;

    // Convert to array
    if (!Array.isArray(eventList)) {
        eventList = [eventList];
    }

    // Max 3 validation
    if (eventList.length > 3) {
        return res.send("Error: You can select maximum 3 events only.");
    }

    // Duplicate check
    const existing = await collection.findOne({ regno: regno });
    if (existing) {
        return res.send("Error: Register number already exists.");
    }

    // Insert data
    await collection.insertOne({
        regno: regno,
        name: name,
        events: eventList
    });

    res.send("Registration successful!");
});


// Show admin search page
app.get('/search', (req, res) => {
    res.sendFile(__dirname + '/search.html');
});


// Handle search
app.post('/search', async (req, res) => {
    const regno = req.body.regno;

    const db = client.db(dbName);
    const collection = db.collection("registrations");

    const result = await collection.findOne({ regno: regno });

    if (!result) {
        return res.send("No record found");
    }

    res.send(`
        <h2>Registration Details</h2>
        Register Number: ${result.regno} <br>
        Name: ${result.name} <br>
        Events: ${result.events.join(", ")}
    `);
});


// ---------------- START SERVER ---------------- //

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});