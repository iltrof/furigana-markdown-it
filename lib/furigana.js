"use strict";

const rubyHelper = require("./ruby");

module.exports = function process(state, silent) {
  const ruby = rubyHelper.parse(state);
  if (ruby === null) {
    return false;
  }

  state.pos = ruby.nextPos;

  if (silent) {
    return true;
  }

  rubyHelper.addTag(state, ruby);
  return true;
};
