"use strict";

module.exports.parse = function(state) {
  if (state.src.charAt(state.pos) !== "[") {
    return null;
  }

  const bodyStartBracket = state.pos;
  const bodyEndBracket = state.md.helpers.parseLinkLabel(
    state,
    state.pos,
    false
  );

  if (bodyEndBracket === -1 || state.src.charAt(bodyEndBracket + 1) !== "{") {
    return null;
  }

  const toptextStartBracket = bodyEndBracket + 1;
  const toptextEndBracket = state.src.indexOf("}", toptextStartBracket);

  if (toptextEndBracket === -1 || toptextEndBracket >= state.posMax) {
    return null;
  }

  const body = state.src.slice(bodyStartBracket + 1, bodyEndBracket);
  const toptext = state.src.slice(toptextStartBracket + 1, toptextEndBracket);
  if (body.trim() === "" || toptext.trim() === "") {
    return null;
  }

  return {
    body: body,
    body_start: bodyStartBracket + 1,
    body_end: bodyEndBracket - 1,
    toptext: toptext,
    nextpos: toptextEndBracket + 1
  };
};

module.exports.addTag = function(state, ruby) {
  function push_text(content) {
    const token = state.push("text", "", 0);
    token.content = content;
  }

  state.push("ruby_open", "ruby", 1);

  const old_pos = state.pos;
  const old_posMax = state.posMax;
  state.pos = ruby.body_start;
  state.posMax = ruby.body_end + 1;

  state.md.inline.tokenize(state);

  state.pos = old_pos;
  state.posMax = old_posMax;

  state.push("rp_open", "rp", 1);
  push_text("【");
  state.push("rp_close", "rp", -1);

  state.push("rt_open", "rt", 1);
  push_text(ruby.toptext);
  state.push("rt_close", "rt", -1);

  state.push("rp_open", "rp", 1);
  push_text("】");
  state.push("rp_close", "rp", -1);

  state.push("ruby_close", "ruby", -1);
};
