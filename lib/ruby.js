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
    bodyStart: bodyStartBracket + 1,
    bodyEnd: bodyEndBracket - 1,
    toptext: toptext,
    nextPos: toptextEndBracket + 1
  };
};

module.exports.addTag = function(state, ruby) {
  function pushText(content) {
    const token = state.push("text", "", 0);
    token.content = content;
  }

  state.push("ruby_open", "ruby", 1);

  const oldPos = state.pos;
  const oldPosMax = state.posMax;
  state.pos = ruby.bodyStart;
  state.posMax = ruby.bodyEnd + 1;

  state.md.inline.tokenize(state);

  state.pos = oldPos;
  state.posMax = oldPosMax;

  state.push("rp_open", "rp", 1);
  pushText("【");
  state.push("rp_close", "rp", -1);

  state.push("rt_open", "rt", 1);
  pushText(ruby.toptext);
  state.push("rt_close", "rt", -1);

  state.push("rp_open", "rp", 1);
  pushText("】");
  state.push("rp_close", "rp", -1);

  state.push("ruby_close", "ruby", -1);
};
