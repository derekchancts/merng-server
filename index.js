require('dotenv').config();
// const express = require('express');
const { ApolloServer } = require('apollo-server');
const { PubSub } = require('graphql-subscriptions')
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");

const { makeExecutableSchema } = require('@graphql-tools/schema')
// const { createServer } = require('http');
// const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core")
// const { WebSocketServer } = require('ws')
// const { useServer } = require('graphql-ws/lib/use/ws');


// const app = express();


// const { gql } = require('apollo-server');
const mongoose = require('mongoose');
// const connectDB = require('./config/db')

const pubsub = new PubSub();

// const Post = require('./models/Post')
// const User = require('./models/User')

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const schema = makeExecutableSchema({ typeDefs, resolvers });


// const typeDefs = gql`
//   type Post {
//     id: ID!
//     body: String!
//     createdAt: String!
//     username: String!
//   }

//   type Query {
//     # sayHi: String!
//     getPosts: [Post]
//   }
// `

// const resolvers = {
//   Query: {
//     // sayHi: () => 'Hello!'
//     async getPosts() {
//       try {
//         const posts = await Post.find({})
//         return posts
//       } catch (err) {
//         throw new Error(err)
//       }
//     } 
//   }
// }


const PORT = process.env.PORT || 5000;


// const server = new ApolloServer({
//   introspection: true,
//   typeDefs: schema,
//   resolvers,
//   context: async ({ req, connection }) => {
//       const me = await getMe(req);
//       return {
//         models,
//         me,
//         secret: process.env.SECRET,
//       };
//   },
// });


const server = new ApolloServer({
  // typeDefs,
  // resolvers,
  schema,
  context: ({ req }) => ({ req, pubsub }), //we get the "req" "res" from express. Then pass it to the context, so that we can access it in the context
  csrfPrevention: true,
  cache: 'bounded',
  // plugins: [
  //   ApolloServerPluginInlineTrace({
  //     rewriteError: (err) => err.message.match(SENSITIVE_REGEX) ? null : err,
  //   }),
  // ],
});


// server.applyMiddleware({ app, path: '/graphql' });
// const httpServer = http.createServer(app);
// server.installSubscriptionHandlers(httpServer);



// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });

// server.listen({ port: 5000 }).then(res => console.log(`Server running at ${res.url}`))

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch(err => {
    console.error(err)
  })
