const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = (context) => ({
  plugins: [
    tailwindcss("./tailwind.config.js"),
    autoprefixer,
    context.env === "production"
      ? purgecss({
          content: ["./src/**/*.tsx", "./public/index.html"],
          defaultExtractor: (content) =>
            content.match(/[A-Za-z0-9-_:/]+/g) || [],
        })
      : null,
  ],
});
