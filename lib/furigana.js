"use strict";

const ruby_helper = require("./ruby");

module.exports = function process(state, silent) {
  const ruby = ruby_helper.parse(state);
  if (ruby === null) {
    return false;
  }

  state.pos = ruby.nextpos;

  if (silent) {
    return true;
  }

  ruby_helper.addTag(state, ruby);
  return true;
};
