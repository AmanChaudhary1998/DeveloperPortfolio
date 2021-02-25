const express = require('express')
const path = require('path');

const conncetDB = require('./config/db');
const usersRoute = require('./routes/api/users');
const authRoute = require('./routes/api/auth');
const profileRoute = require('./routes/api/profile');
const postRoute = require('./routes/api/post');

const app= express();

conncetDB();

// Init Middleware
app.use(express.json({extended:false}));

const PORT = process.env.PORT || 5000;

// Define Routes
app.use('/api/users',usersRoute);
app.use('/api/auth',authRoute);
app.use('/api/profile',profileRoute);
app.use('/api/posts',postRoute);

// Serve static assets in production
if(process.env.NODE_ENV === 'production')
{
    // Serve static folder
    app.use(express.static('client/build'));

    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'));
    });
}

app.listen(PORT,()=>{
    console.log(`connected to the server successfully at http://localhost:${PORT}`)
})