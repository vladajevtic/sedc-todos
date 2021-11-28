const express = require('express');
const router = new express.Router();
const Todo = require('../models/todo');
const auth =require('../middleware/auth');


router.get('/todos', auth, async (req, res) => {
    try{
        await req.user.populate({
            path: 'todos'
        });

        res.send(req.user.todos);
    } catch (e) {
        res.status(500).send(e);
    }
   
});

router.get('/todos/:id', auth,  async (req, res) =>{
    const _id = req.params.id;
    try{
        const findToDo = await Todo.findOne({ _id, owner: req.user._id });
        if(!findToDo){
            return res.status(400).send();
        }
        res.send(findToDo);
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/todos', auth, async (req,res) =>{
    const todo = new Todo({
        ...req.body,
        owner: req.user._id,
    });
    try{
        await todo.save();
        res.status(201).send(todo);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.patch('/todos/:id', auth,  async (req,res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowUpdates = ['name', 'description', 'completed'];
    const isAllowedUpdate = updates.every((update) => allowUpdates.includes(update));
    if(!isAllowedUpdate){
        return res.status(403).send({error: "invalid updates"});
    }
    const todo = await Todo.findOne({ _id, owner: req.user._id });
    updates.forEach((update) => todo[update] = req.body[update]);
    try{
        await todo.save();
        res.status(201).send(todo);
    } catch (e) {
        res.status(400).send(e);
    }
    
});

router.delete('/todos/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try{
        const todo = await Todo.findOneAndDelete({ _id, owner: req.user._id });
        if(!todo){
            res.status(404).send({error: 'not found'});
        }
        res.send({
            ...todo,
            deleted: true
        })
    } catch (e){
        res.status(500).send()
    }
})

module.exports = router;