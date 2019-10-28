const express = require('express');
const cors = require('cors');
const uuid = require('uuid/v5');

// Firebase init
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Express and CORS middleware init

const app = express();
app.use(cors());


app.use((request, response, next) => {
    request.header("Access-Control-Allow-Origin", "*");
    response.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});


const user_id = (data) => {
    const namespace = `${data}`;

    return uuid(namespace, uuid.DNS);
};

app.post("/", async (request, response) => {
    try {
        const {
            first_name,
            last_name,
            birth_day,
            age,
            hobby
        } = request.body;
        await admin.database().ref('/users').push({
            first_name,
            last_name,
            birth_day,
            age,
            hobby
        });
        return response.status(200).send({
            first_name,
            last_name,
            birth_day,
            age,
            hobby
        })
    } catch (error) {
        return response.status(500).send('Something went wrong: ' + error.message);
    }
});

app.get("/", (request, response) => {
    return admin.database().ref().on("value", snapshot => {
        return response.status(200).send(snapshot.val());
    }, error => {
        return response.status(500).send('Something went wrong: ' + error.message);
    });
});

exports.users = functions.https.onRequest(app);

exports.addUserId = functions.database.ref('/users/{pushID}')
    .onCreate((snapshot) => {
        const formData = snapshot.val();

        return snapshot.ref.update({
            id: user_id(formData['birth_day']),
        });
    });