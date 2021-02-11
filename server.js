const express = require('express')

const conncetDB = require('./config/db');
const usersRoute = require('./routes/api/users');
const authRoute = require('./routes/api/auth');
const profileRoute = require('./routes/api/profile');
const postRoute = require('./routes/api/post');

const app= express();

conncetDB();

// Init Middleware
app.use(express.json({extenden:false}));

const PORT = process.env.PORT || 5000;

app.get('/',(req,res,next)=>{
    res.write("<h1>Hello</h1>");
    res.end()
});

app.use('/api/users',usersRoute);
app.use('/api/auth',authRoute);
app.use('/api/profile',profileRoute);
app.use('/api/posts',postRoute);

app.listen(PORT,()=>{
    console.log(`connected to the server successfully at http://localhost:${PORT}`)
})