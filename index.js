"use strict";

function parseRuby(text, start_pos) {
  if (text.charAt(start_pos) !== "[") {
    return null;
  }

  const bodyStartBracket = start_pos;
  const bodyEndBracket = text.indexOf("]", bodyStartBracket);

  if (bodyEndBracket === -1 || text.charAt(bodyEndBracket + 1) !== "{") {
    return null;
  }

  const toptextStartBracket = bodyEndBracket + 1;
  const toptextEndBracket = text.indexOf("}", toptextStartBracket);

  if (toptextEndBracket === -1) {
    return null;
  }

  return {
    body: text.slice(bodyStartBracket + 1, bodyEndBracket),
    toptext: text.slice(toptextStartBracket + 1, toptextEndBracket),
    nextpos: toptextEndBracket + 1
  };
}

function addRubyTag(state, body, toptext) {
  function push_text(content) {
    const token = state.push("text", "", 0);
    token.content = content;
  }

  state.push("ruby_open", "ruby", 1);

  push_text(body);

  state.push("rp_open", "rp", 1);
  push_text("【");
  state.push("rp_close", "rp", -1);

  state.push("rt_open", "rt", 1);
  push_text(toptext);
  state.push("rt_close", "rt", -1);

  state.push("rp_open", "rp", 1);
  push_text("】");
  state.push("rp_close", "rp", -1);

  state.push("ruby_close", "ruby", -1);
}

module.exports = function furigana_plugin(md, options) {
  md.inline.ruler.push("furigana", (state, silent) => {
    const ruby = parseRuby(state.src, state.pos);
    if (ruby === null) {
      return false;
    }

    state.pos = ruby.nextpos;

    if (silent) {
      return true;
    }

    addRubyTag(state, ruby.body, ruby.toptext);
    return true;
  });
};
