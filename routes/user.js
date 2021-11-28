const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail } = require('../email/user');
const { sendCancelEmail } = require('../email/user');
const multer  = require('multer');
const sharp = require('sharp');

router.post('/users', async (req,res) => {
    const user = new User(req.body);
    try{
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({ user, token });
    }catch (e) {
        res.status(400).send({
            message: 'Could not register',
            error: e,
        });
    }    
});

router.get('/users', async (req,res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }catch (e) {
        res.status(500).send(e);
    }
    
})

router.post('/users/login', async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.status(200).send({user, token})    
    }catch (e){
        res.status(400).send({ message:'could not log in',
                                error: e});
    }
    // const foundUser = db.findUser(user);
    // const tokens = generateToken();
    // res.send({
    //     user: foundUser,
    //     token,
    // })
});
router.post('/users/logout', auth, async (req, res) =>{
    try{
        const user = req.user;
        user.tokens = user.tokens.filter((token) => token.token !== req.token);
        await user.save();
        res.status(200).send();
    }catch (e){
        res.status(500).send();
    }
})

router.get('/users/me', auth, async (req,res) =>{
    res.send(req.user);
})

router.patch('/users/me', auth, async (req, res) =>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValid = updates.every((update) => allowedUpdates.includes(update));
    if(!isValid){
        return res.status(400).send({error: "invalid"});
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    }catch (e){
        res.status(400).send();
    }
    // const user = db.find(req.body);
    // res.status(200).send(user);
});

const upload = multer({
    limits:{
        fileSize: 10000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Upload image'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    try{
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
        
        let newbuffer = new Buffer.from(buffer).toString('base64');
        
        req.user.avatar = buffer
        await req.user.save();
        res.status(201).send({
            buffer: newbuffer,
        });
    }catch(e){
        res.status(400).send({ error: e.message });
    }
}); 


module.exports = router;
