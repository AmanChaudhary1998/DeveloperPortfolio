const express = require('express');
const {check,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

const router = express.Router();

router.get('/', auth ,async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({msg:"Login failed"});
    }
});

router.post('/login', [
    check('email','Please enter the valid email').isEmail(),
    check('password','Please enter the password').exists()
],async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(401).json({errors:errors.array()});
    }
    try {
        const {email,password} = req.body;

        let user = await User.findOne({email})
        if(!user)
        {
            return res.status(401).json({errors:[{msg:"Invalid User"}]});
        }
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch)
        {
            return res.status(401).json({errors:[{msg:"Invalid User"}]});
        }

        const payload = {
            user:{
                id: user.id
            }
        };
        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:3600},
        (err,token)=>{
            if(err)
            {
                console.error(err.message);
                throw err;
            }
            return res.json({token});
        });
    } catch (error) {
        console.error(error.message);
    }
})

module.exports = router;