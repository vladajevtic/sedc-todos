require('dotenv').config();
require('./db/db');

const userRoutes = require('./routes/user');
const todosRoutes = require('./routes/todos');
const express = require('express');
const cors = require('cors');
const { PORT } = process.env;
const app = express();

app.use(cors({
    origin: 'http://localhost:4200',
}));
app.use(express.json());
app.use(userRoutes);
app.use(todosRoutes);


app.listen(PORT, () => {
    console.log(`server is listening ${PORT}`);
})