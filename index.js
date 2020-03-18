"use strict";

module.exports = function(options) {
  return function(md) {
    md.inline.ruler.push("furigana", require("./lib/furigana")(options));
  };
};
