const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const User = require('../../models/User');


function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
    // { expiresIn: '1h' }
    // { expiresIn: '30d' }
  );
}


module.exports = {
  Mutation: {
    // async login(_, { username, password }, ctx) {
    async login(parent, { username, password }, ctx) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) throw new UserInputError('Errors', { errors });

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong credentials';
        throw new UserInputError('Wrong credentials', { errors });
      }

      const token = generateToken(user);
      // const token = jwt.sign({
      //   id: user.id,
      //   email: user.email,
      //   username: user.username
      // }, process.env.JWT_SECRET, { expiresIn: '1h' })
      // console.log(token)

      let data = user.toJSON();
      // console.log(data)

      return {
        // ...user._doc,
        // id: user._id,
        // token
        ...data,
        id: data._id,
        token
      }
  
    },

    async register(parent, { registerInput : { username, email, password, confirmPassword } }, ctx, info) {
      // TODO: Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // TODO: Make sure user doesnt already exist
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken'
          }
        });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new UserInputError('Email is taken', {
          errors: {
            email: 'This Email is taken'
          }
        });
      }

      // TODO: hash password and create an auth token
      // password = await bcrypt.hash(password, 12);
       // password = await bcrypt.hash(password, 12);
       const salt = await bcrypt.genSalt(12)
       password = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      });

      let res = await newUser.save();
      let data  = res.toJSON();
      // let data = res.toObject()
      // console.log(data)


      // const token = jwt.sign({
      //   id: res.id,
      //   email: res.email,
      //   username: res.username
      // }, process.env.JWT_SECRET, { expiresIn: '1h' })
      const token = generateToken(res);

      return {
        // ...res._doc,
        // id: res._id,
        ...data,
        id: data._id,
        token
      }
    }

  }
}