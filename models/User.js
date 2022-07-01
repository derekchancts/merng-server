// const mongoose = require('mongoose');
const { model, Schema } = require('mongoose');


// because we are using Graphql, we can use it to define which fields are required, instead of using Mongoose Schema


// const userSchema = new mongoose.Schema({
const userSchema = new Schema({
  username: String,   
  password: String,
  email: String,
  createdAt: String
});

// module.exports = mongoose.model('User', userSchema);
module.exports = model('User', userSchema);
