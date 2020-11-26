const path = require("path");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const graphqlResolvers = require("./graphql/resolvers");
const context = require("./graphql/context");
const db = require("./db");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { addResolversToSchema } = require("@graphql-tools/schema");

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
apolloServer.applyMiddleware({ app });

// Serve static assets
app.use(express.static(path.resolve(__dirname, "..", "build")));

// Always return the main index.html, so react-router render the route in the src
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});

async function start() {
  try {
    await db.verifyConnection();
  } catch (e) {
    console.error(e);
    return;
  }

  console.log("DB connection verified");
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(
      `Server successfully started on port ${PORT} with NODE_ENV=${process.env.NODE_ENV}.`
    );
  });
}

start();
