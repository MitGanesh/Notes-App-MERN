const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/notesapp';

const connectToMonngo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connected to Mongo Successfully");
    })
}

module.exports = connectToMonngo;