const mongoose = require('mongoose');
const connectionString = process.env.MONGODB_URL;
mongoose.connect(connectionString).then(() => {
    console.log('Connected to DB', connectionString);
})