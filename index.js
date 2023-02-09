const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3434;
const path = require('path');
const genCsv = require('./Services/cybertill').genCsv;
var cron = require('node-cron');

const uploadFile = require('./Services/Auth/google-auth').uploadFile
//CREDENTIALS_PATH

// Initialize express as an app instance
const app = express();

// CORS middleware
app.use(cors({origin: '*'}));

// Body parsers
app.set("port", process.env.port || port);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET,PATCH, PUT, DELETE, POST, OPTIONS"
    );
    next();
});

// Form route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// Run without cron
// let main = async() => {
//     const data = await genCsv()
//                     .then(await uploadFile())
// }
// main()

// Run with cron, every 3 hours between 8-5 Uk time
cron.schedule('0 5-17/3 * * *', () => {
    let main = async() => {
        const data = await genCsv()
                        .then(await uploadFile())
    }
    main()
}, {
    timezone: "Europe/London"
})

// Server 
app.listen(port, () => {
    console.log('Server running on port '+ port)
})