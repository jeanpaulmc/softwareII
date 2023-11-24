require('dotenv').config();

const express = require('express');
const app = express();

app.get('/weather', (req, res) => {
    const temperature = parseInt(req.query.temperature);
    const day = new Date(req.query.day);

    const query = {
        temperature: {
            $gte: temperature,
            $lt: temperature + 1
        },
        day: day
    };

    MongoClient.connect(process.env.MONGODB_CONNECTION_URL, function(err, client) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            const db = client.db(process.env.DATABASE_NAME);
            const collection = db.collection('weather');
            collection.find(query).toArray(function(err, result) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.json(result);
                }
                client.close();
            });
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
