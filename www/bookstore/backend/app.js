const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();


//importa las rutas
const productsRoute = require('./routes/products');
const usersRoute = require('./routes/orders');

//Usa las rutas
app.use(express.json());
app.use('/api/products',productsRoute);
app.use(express.json());
app.use('/api/orders',usersRoute);


app.use(cors({
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With Accept',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
    origin:'http://localhost:3000', 
    origin: "*",
    methods:['GET','POST','PATCH','DELETE','PUT'],
}));

app.use(logger('dev'));
//app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;
