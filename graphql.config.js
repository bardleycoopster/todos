module.exports = {
  projects: {
    app: {
      schema: ["server/graphql/schema.js"],
      documents: ["src/**/*.{graphql,js,ts,jsx,tsx}"],
      extensions: {
        endpoints: {
          default: {
            url: "http://localhost:8000",
            headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
          },
        },
      },
    },
  },
};
