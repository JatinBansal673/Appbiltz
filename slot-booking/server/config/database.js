const mongoose = require('mongoose');

require('dotenv').config({path: './.env'});
// console.log(process.env.DB_URL);
const dbConnect = () =>
{
    mongoose.connect(process.env.DB_URL,{
    })
    .then( () => {
        console.log('Connection Successful');
    })
    .catch( (error) => {
        console.log('Issue in DB connection');
        console.error(error.message);
        process.exit(1);
    });
}

module.exports = dbConnect;