"use strict";

module.exports.parse = parse;
module.exports.addTag = addTag;
module.exports.addTagNoFallback = addTagNoFallback;

/**
 * Parses the [body]{toptext} syntax and returns
 * the body and toptext parts. These are then processed
 * in furigana.js and turned into \<ruby\> tags by
 * the {@link addTag} function.
 *
 * @param {*} state InlineState of the markdown-it processor
 * @returns {{body: string, toptext: string, nextPos: int}}
 * body: the main text part of the \<ruby\> tag
 *
 * toptext: the top part of the \<ruby\> tag
 *
 * nextPos: index of the next character in the markdown source
 */
function parse(state) {
  if (state.src.charAt(state.pos) !== "[") {
    return null;
  }

  const bodyStartBracket = state.pos;
  const bodyEndBracket = state.src.indexOf("]", bodyStartBracket);

  if (
    bodyEndBracket === -1 ||
    bodyEndBracket >= state.posMax ||
    state.src.charAt(bodyEndBracket + 1) !== "{"
  ) {
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
}

/**
 * Takes as content a flat array of main parts of
 * the ruby, each followed immediately by the text
 * that should show up above these parts.
 *
 * That content is then stored in its appropriate
 * representation in a markdown-it's inline state,
 * eventually resulting in a \<ruby\> tag.
 *
 * This function also creates fallback parentheses
 * (【】), should the \<ruby\> tag be unsupported.
 *
 * @example
 * addTag(state, ['猫', 'ねこ', 'と', '', '犬', 'いぬ'])
 * // markdown-it will eventually produce a <ruby> tag
 * // with 猫と犬 as its main text, with ねこ corresponding
 * // to the 猫 kanji, and いぬ corrsponding to the 犬 kanji.
 *
 * @param {*} state
 * @param {string[]} content
 */
function addTag(state, content) {
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
}

/**
 * Same as {@link addTag}, but doesn't create
 * fallback parentheses.
 * @param {*} state
 * @param {string[]} content
 */
function addTagNoFallback(state, content) {
  function pushText(text) {
    const token = state.push("text", "", 0);
    token.content = text;
  }

  state.push("ruby_open", "ruby", 1);

  for (let i = 0; i < content.length; i += 2) {
    const body = content[i];
    const toptext = content[i + 1];

    pushText(body);

    state.push("rt_open", "rt", 1);
    if (toptext !== "") {
      pushText(toptext);
    }
    state.push("rt_close", "rt", -1);
  }

  state.push("ruby_close", "ruby", -1);
}
