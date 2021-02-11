const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const conncetDB = async () =>{
    try {
        await mongoose.connect(db,{
            useUnifiedTopology:true,
            useNewUrlParser:true,
            useCreateIndex:true,
            useFindAndModify:false
        });

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error(error.message)
        // Exit the process with failure

        process.exit(1);
    }
}

module.exports = conncetDB;