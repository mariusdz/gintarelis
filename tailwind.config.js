/** Temporary config used to build the static Tailwind bundle (replaces CDN). */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: { extend: {} },
  plugins: [],
};
