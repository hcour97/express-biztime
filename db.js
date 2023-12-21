/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

// determine if running in test mode: 
if (process.env.NODE_ENV === "test") {
    DB_URI = "postgress:///biztime_test";
} else {
    DB_URI = "postgress:///biztime";
};

// configure db:
let db = new Client({
    connectionString: DB_URI
});

// start connection:
db.connect();

//export:
module.exports = db;


