const express = require('express');
const {check,validationResult} = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

const router = express.Router();

/*
@route  GET /api/profile/me
@desc   GET current users api
@access Private
*/

router.get('/me',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({user : req.user.id}).populate('user',['name','avatar']);
        if(!profile)
        {
            return res.status(400).json({msg:"User profile doesn't exists"});
        }
        return res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.json("Server Error");
    }
});

/*
@route POST /api/profile
@desc POST  profile
@access PRIVATE
*/

router.post('/', [auth, [
    check('status','status is required').not().isEmpty(),
    check('skills','skills are required').not().isEmpty()
]],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        twitter,
        youtube,
        facebook,
        instagram,
        linkedin
    } = req.body;
    // Build a Profile object
    let profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill =>skill.trim());
    }
    // Build social object
    profileFields.social = {};
    if(twitter) profileFields.social.twitter = twitter;
    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;
     
    try {
        let profile = await Profile.findOne({user:req.user.id})

        if(profile)
        {
            //Update
            profile = await Profile.findOneAndUpdate({user:req.user.id},{$set: profileFields},{new:true});

            return res.json(profile);
        }
        // Create
        profile = new Profile(profileFields);

        await profile.save();
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
})

/*
@route GET /api/profile
@desc  GET all profiles
@access PRIVATE
*/
router.get('/', async (req,res,next)=>{
    const profile = await Profile.find().populate('user',['name','avatar'])

    return res.json(profile);
});

/*
@route GET /api/profile/user/:userId
@desc GET user profile desc
@access Public
*/
router.get('/user/:userId', async (req,res,next)=>{
    try {
        const profile = await Profile.findOne({user: req.params.userId}).populate('user',['name','avatar'])
        if(!profile)
        {
            return res.status(400).json({msg:"User profile doesn't exists"});
        }
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind =='ObjectId')
        {
            return res.status(400).json({msg:"User profile doesn't exists"})
        }
        res.json("Error");
    }
});

/*
@route DELETE api/profile
@desc DELETE profile user and posts
@access private
*/
router.delete('/', auth, async (req,res,next)=>{
    try {
        
    //Remove the posts
    await Post.deleteMany({user:req.user.id})
    // Remove the profile
    await Profile.findOneAndRemove({user: req.user.id})
    // Remove the user
    await User.findOneAndDelete({_id: req.user.id})

    return res.json({msg:"User Profile deleted"});
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
});
/*
@route PUT /api/profile/experience
@desc  add experience into the profile
@access PRIVATE
*/
router.put('/experience', [auth,[
    check('title','Tile is required').not().isEmpty(),
    check('company','Company name is required').not().isEmpty(),
    check('from','From Date is required').not().isEmpty()
]], async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user:req.user.id})

        profile.experience.unshift(newExp);
        await profile.save();
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json("Error");
    }
});
/*
@route DELETE /api/experience/:expId
@desc Delete experience from profile
@access Private
*/
router.delete('/experience/:expId', auth, async (req,res,next)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id});

    // Get remove index
    const indexRemove = profile.experience.map(item => item.id).indexOf(req.params.expId)

    profile.experience.splice(indexRemove,1);

    await profile.save();

    return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json("Error");
    }
});
/*
@route PUT /api/profile/education
@desc PUT add the education
@access Private
*/
router.put('/education', [auth,[
    check('college','Mention the college name').not().isEmpty(),
    check('fieldofstudy','Mention fieldofstudy').not().isEmpty()
]], async(req,res,next)=>{
   const errors = validationResult(req);
   if(!errors.isEmpty())
   {
    return res.status(400).json({errors:errors.array()})
   }
    const {
        college,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;
    const eduDetail = {
    college,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
    }
    try{
        const profile = await Profile.findOne({user:req.user.id});
        profile.education.unshift(eduDetail);
        await profile.save();
        return res.json(profile);
   } catch (error) {
       console.error(error.message);
       return res.json('Error');
   }
});
/*
@route DELETE /api/profile/education/:eduId
@desc delete education details
@access private
*/
router.delete('/education/:eduId', auth, async(req,res,next)=>{
    try {
        const profile = await Profile.findOne({user:req.user.id});

        // Get the remove index
        const indexRemove = profile.education.map(item => item.id).indexOf(req.params.eduId);
        profile.education.splice(indexRemove,1);
        await profile.save();
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.json("Error");
    }
});

module.exports = router;