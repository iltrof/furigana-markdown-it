"use strict";

module.exports = function furigana_plugin(md, options) {
  md.inline.ruler.push("furigana", (state, silent) => {
    if (state.src.charAt(state.pos) !== "[") {
      return false;
    }

    const textStartBracket = state.pos;
    const textEndBracket = state.src.indexOf("]", textStartBracket);

    if (textEndBracket === -1) {
      return false;
    }

    if (state.src.charAt(textEndBracket + 1) !== "{") {
      return false;
    }

    const rubyStartBracket = textEndBracket + 1;
    const rubyEndBracket = state.src.indexOf("}", rubyStartBracket);

    if (rubyEndBracket === -1) {
      return false;
    }

    state.pos = rubyEndBracket + 1;

    if (silent) {
      return true;
    }

    function push_text(content) {
      const token = state.push("text", "", 0);
      token.content = content;
    }

    state.push("ruby_open", "ruby", 1);

    push_text(state.src.slice(textStartBracket + 1, textEndBracket));

    state.push("rp_open", "rp", 1);
    push_text("【");
    state.push("rp_close", "rp", -1);

    state.push("rt_open", "rt", 1);
    push_text(state.src.slice(rubyStartBracket + 1, rubyEndBracket));
    state.push("rt_close", "rt", -1);

    state.push("rp_open", "rp", 1);
    push_text("】");
    state.push("rp_close", "rp", -1);

    state.push("ruby_close", "ruby", -1);

    return true;
  });
};
