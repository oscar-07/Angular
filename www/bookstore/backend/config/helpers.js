//const mysql = require('mysql');

const Mysqli = require('mysqli');

let conn = new Mysqli({
    Host: 'localhost', // IP/domain name 
    post: 3306, // port, default 3306 
    user: 'root', // username 
    passwd: 'casita', // password 
    db: 'mega_shop'
});

let db = conn.emit(false, '');
module.exports = {
    database: db
}

