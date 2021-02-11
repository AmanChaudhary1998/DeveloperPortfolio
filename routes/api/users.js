const express = require('express')
const {check,validationResult} = require('express-validator');
const gravatar = require('gravatar');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');

const router  = express.Router();

// @route POST api/users
// desc Register user
// @access Public
router.post('/', [
    check('name','Name must be required').not().isEmpty(),
    check('email','Please enter the valid email').isEmail(),
    check('password','Please enter the password of min length 6').isLength({min:6})
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    try {

        const {name,email,password} = req.body;
        // See user already exists

        let user = await User.findOne({email})
        if(user)
        {
            return res.status(400).json({errors:[{msg:"User already exists"}]});
        }
        // Get user gravatar
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            password,
            avatar
        });
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);

        await user.save();
        // Return jsonwebtoken
        const payload = {
            user:{
                id:user.id
            }
        };
        jwt.sign(payload, config.get('jwtSecret'),
        {expiresIn:3600}, // Include expires is an optional part
        (err,token)=>{
            if(err)
            {
                console.error(error.message);
                throw err;
            }
            return res.json({token});
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;