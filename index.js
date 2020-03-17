"use strict";

module.exports = function furigana_plugin(md, options) {
  md.inline.ruler.push("furigana", require("./lib/furigana"));
};
