// const token = process.env.API_TOKEN;
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJhaGVycmlvdCIsImlhdCI6MTYwNjM1Njk1MCwiZXhwIjoxNjA2OTYxNzUwfQ.QOlWpTJS7URgPoLxrDV_p8-nKVmABuoAUCZtMjDr3EA";
module.exports = {
  schema: "server/graphql/schema.graphql",
  documents: "src/**/*.{gql,graphql,js,ts,jsx,tsx}",
  extensions: {
    endpoints: {
      default: {
        url: "http://localhost:8000/graphql",
        headers: { authorization: `Bearer ${token}` },
        introspect: false,
      },
    },
  },
};
