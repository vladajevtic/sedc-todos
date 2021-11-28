const mongoose = require('mongoose');

const todosSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: false
    },
    completed:{
        type: Boolean,
        default: false,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const Todo = mongoose.model('Todo', todosSchema);
module.exports = Todo;