const express = require('express')

const app= express()

const PORT = process.env.PORT || 5000;

app.get('/',(req,res,next)=>{
    res.write("<h1>Hello</h1>");
    res.end()
})

app.listen(PORT,()=>{
    console.log(`connected to the server successfully at http://localhost:${PORT}`)
})