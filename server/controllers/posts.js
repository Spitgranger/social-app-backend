import mongoose from 'mongoose';
import PostMessage from '../models/postMessage.js'


export const getPosts = async (req, res) => {
    try {
        const postMessages = await PostMessage.find();
        console.log(postMessages);
        res.status(200).json(postMessages);
    } catch (error) {
        res.status(404).json( {message: error.message} )
    }
}

export const createPost = async (req, res) => {
    const post = req.body;
    const newPost = new PostMessage({...post, creator: req.userId, createdAt: new Date().toISOString()});
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json( {message: error.message} )
        console.log(error.message)
    }
}

export const updatePost = async (req,res) => {
    const { id: _id } = req.params;
    const post = req.body;
    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('NO POST WITH THAT ID');
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, {...post, _id}, {new: true});
    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No post with that id");
    try{
        await PostMessage.findByIdAndDelete(id)
        res.json( {message: 'Post deleted successfully'} );
    } catch (error) {
        console.log(error);
    }
}

export const likePost = async (req, res) => {
    const { id: _id } = req.params;

    if(!req.userId) return res.json({message: 'not logged in'})
    
    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("No post with that id");
    const post = await PostMessage.findById(_id);
    const index = post.likes.findIndex((_id) => _id === String(req.userId)); 
    if(index === -1){
        //like
        post.likes.push(req.userId)
    } else {
        //dislike
        post.likes = post.likes.filter((id) => id !== String(req.userId))
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {new: true})
    res.json(updatedPost)
}