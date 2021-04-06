const path = require("path");
const http = require("http");
const express = require("express");
const { execute, subscribe } = require("graphql");
const { ApolloServer } = require("apollo-server-express");
const expressPlayground = require("graphql-playground-middleware-express")
  .default;
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");
const jwt = require("jsonwebtoken");

const graphqlResolvers = require("./graphql/resolvers");
const context = require("./graphql/context");
const config = require("./config");
const db = require("./db");

const graphqlSchema = loadSchemaSync(
  path.resolve(__dirname, "graphql", "schema.graphql"),
  {
    loaders: [new GraphQLFileLoader()],
  }
);

const schemaWithResolvers = addResolversToSchema({
  schema: graphqlSchema,
  resolvers: graphqlResolvers,
});

const apolloServer = new ApolloServer({
  schema: schemaWithResolvers,
  context,
});

const app = express();

app.get(
  "/playground",
  expressPlayground({
    endpoint: "/graphql",
    subscriptionEndpoint: `/subscriptions`,
  })
);

// Serve static assets
app.use(express.static(path.resolve(__dirname, "..", "build")));

// Always return the main index.html, so react-router render the route in the src
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});

async function start() {
  try {
    await db.verifyConnection();
    console.log("DB connection verified.");
  } catch (e) {
    console.error("DB connection failed.", e);
    process.exit(2);
  }

  await apolloServer.start();
  console.log("Apollo server started.");

  const httpServer = http.createServer(app);
  apolloServer.applyMiddleware({ app });

  const PORT = process.env.PORT || 8000;
  await new Promise((resolve) => httpServer.listen(PORT, resolve));

  console.log(`HTTP server started.`);

  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema: schemaWithResolvers,
      keepAlive: 30000,
      onConnect: ({ authorization }, webSocket, context) => {
        console.log(context);
        if (authorization) {
          let user;
          let token = authorization.replace("Bearer ", "");

          if (token) {
            jwt.verify(token, config.jwt.secret, (err, decoded) => {
              if (err) {
                if (err.name === "TokenExpiredError") {
                  throw new Error("JWT expired");
                } else {
                  throw new Error("Invalid JWT");
                }
              }

              user = {
                id: decoded.id,
                username: decoded.username,
              };
            });
          }
          return { user };
        }
        throw new Error("Missing JWT authorization");
      },
      onDisconnect: () => {},
    },
    { server: httpServer, path: "/subscriptions" }
  );

  console.log(
    `Main server started: PORT=${PORT}, NODE_ENV=${process.env.NODE_ENV}.`
  );
}

start();
