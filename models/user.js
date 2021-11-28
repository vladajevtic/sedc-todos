const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('password or email are invalid')
            }
        }
    },
    password:{
        type: String,
        required:true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password') || value.toLowerCase().includes('1234')){
                throw new Error("password or email are invalid")
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0 ){
                throw new Error("to low");
            }
        }
    },
    tokens: [
        {
            token:{
                type: String,
                required: false,
            }
        }
    ],
    avatar: {
        type: Buffer
    }
});

userSchema.virtual('todos', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    
    user.tokens = user.tokens.concat({ token });
    
    await user.save();
    
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user){
        throw new Error("unable to log in");
    }

    const hashed = await bcrypt.hash(password, 8);

    const isMatching = await bcrypt.compare(password, user.password);
    
    if(!isMatching){
        throw new Error ('password or email are incorrect')
    }
    return user;
}

userSchema.pre('save', async function (next){
    const user = this;
    if(user.isModified('password') || user.isNew){

        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;