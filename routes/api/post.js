const express = require('express');
const {check, validationResult} = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

const router = express.Router();

/*
@route POST /api/posts
@desc Create a post 
@access PRIVATE
*/
router.post('/',[auth, [
    check('text','Text must be required').not().isEmpty()
]], async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        return res.json(post);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Error');
    }

});
/*
@route GET /api/posts
@desc GET all the posts
@access PRIVATE
*/
router.get('/', auth, async(req,res,next)=>{
    try {
        const posts = await Post.find().sort({date: -1});
        return res.json(posts);
    } catch (error) {
        console.error(error.message);
        return res.status(400).json('Error');
    }
});
/*
@route GET /api/posts/:id
@desc  GET post by id
@access PRIVATE
*/
router.get('/:id', auth, async(req,res,next)=>{
    try {
        const post = await Post.findById(req.params.id)
        console.log(post);
        if(!post)
        {
            return res.json({msg :'Post not found'});
        }
        return res.json(post);
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId')
        {
            return res.status(404).json({msg :'Post not found'});
        }
        return res.status(500).json('Error');
    }
});
/*
@route Delete api/posts/:id
@desc DELETE post of user by id
@access PRIVATE
*/
router.delete('/:id', auth, async(req,res,next)=>{
try {
    const post = await Post.findById(req.params.id);

    //Check post
    if(!post)
    {
        return res.status(500).json({msg:"Post not found"});
    }

    // Check user
    if(post.user.toString() !== req.user.id)
    {
        return res.status(500).json({msg:'Invalid user post'});
    }

    await post.remove();
    return res.json({msg:'Post deleted successfully'});

} catch (error) {
    console.error(error.message);
    return res.status(500).send('Error');
}
});
/*
@route PUT /api/posts/like/:id
@desc like the post
@access PRIVATE
*/
router.put('/like/:id', auth , async(req,res,next)=>{
    try {
      const post = await Post.findById(req.params.id);

      // Check weather the post already contain like
      if(post.likes.filter(like => like.user.toString() === req.user.id.toString()).length>0)
      {
        return res.status(404).json({msg:'post already liked by you'});
      }
      post.likes.unshift({user: req.user.id});
      await post.save()
      return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json('Error');
    }
});
/*
@route PUT /api/posts/unlike/:id
@desc put unlike the post
@access PRIVATE
*/
router.put('/unlike/:id',auth, async(req,res,next)=>{
    try {
        const post = await Post.findById(req.params.id);

        //Check weather the post already unliked
        if(post.likes.filter(like => like.user.toString() === req.user.id.toString()).length == 0)
        {
            return res.status(404).json({msg:'Post has already been unliked'});
        }
        const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id);
        
        post.likes.splice(removeIndex,1);
        await post.save();
        
        return res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json('Error');
    }
});
/*
@route POST api/posts/comment/:id
@desc Comment on a post
@access PRIVATE
*/
router.post('/comment/:id',[auth,[
    check('text','Text must be required').not().isEmpty()
]], async(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    };
    post.comments.unshift(newComment)
    await post.save()
    return res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json('Error');
    }
});
/*
@route DELETE api/posts/comment/:id/:commentId
@desc Delete the comment
@access PRIVATE
*/
router.delete('/comment/:id/:commentId', auth , async(req,res,next)=>{
    try {
        const post = await Post.findById(req.params.id);

        // Pull out the comment
        const comment = post.comments.find(comment=> comment.id === req.params.commentId);

        // Check comment
        if(!comment)
        {
            return res.status(404).json({msg:"Comment doesn't exists"});
        }
        // Check user
        if(comment.user.toString() !== req.user.id.toString())
        {
            return res.status(404).json({msg:"User unauthorized!!"});
        }
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

        post.comments.splice(removeIndex,1);

        await post.save();
        return res.json(post.comments);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json('Error');
    }
})
module.exports = router;