module.exports = {
  schema: "src/server/graphql/schema.graphql",
  documents: "src/client/**/*.{gql,graphql,js,ts,jsx,tsx}",
  extensions: {
    endpoints: {
      default: {
        url: "http://localhost:8000/graphql",
        headers: { authorization: `Bearer ${process.env.API_TOKEN}` },
        introspect: false,
      },
    },
  },
};
