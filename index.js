"use strict";

module.exports = function furiganaPlugin(md, options) {
  md.inline.ruler.push("furigana", require("./lib/furigana"));
};
