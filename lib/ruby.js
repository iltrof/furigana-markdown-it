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
    toptext: toptext,
    nextPos: toptextEndBracket + 1
  };
};

module.exports.addTag = function(state, content) {
  function pushText(text) {
    const token = state.push("text", "", 0);
    token.content = text;
  }

  state.push("ruby_open", "ruby", 1);

  for (let i = 0; i < content.length; i += 2) {
    const body = content[i];
    const toptext = content[i + 1];

    pushText(body);

    if (toptext === "") {
      state.push("rt_open", "rt", 1);
      state.push("rt_close", "rt", -1);
      continue;
    }

    state.push("rp_open", "rp", 1);
    pushText("【");
    state.push("rp_close", "rp", -1);

    state.push("rt_open", "rt", 1);
    pushText(toptext);
    state.push("rt_close", "rt", -1);

    state.push("rp_open", "rp", 1);
    pushText("】");
    state.push("rp_close", "rp", -1);
  }

  state.push("ruby_close", "ruby", -1);
};
