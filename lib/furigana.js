"use strict";

module.exports = furigana;

const rubyHelper = require("./ruby");

const kanaRegex = /[\u3040-\u3096\u30a1-\u30fa\uff66-\uff9dー]/;
const kanjiRegex = /[\u3400-\u9faf]/;

/**
 * Furigana is marked using the [body]{furigana} syntax.
 * First step, performed by bodyToRegex, is to convert
 * the body to a regex, which can then be used to pattern
 * match on the furigana.
 *
 * In essence, every kanji needs to be converted to a
 * pattern similar to ".?", so that it can match some kana
 * from the furigana part. However, this alone is ambiguous.
 * Consider [可愛い犬]{かわいいいぬ}: in this case there are
 * three different ways to assign furigana in the body.
 *
 * Ambiguities can be resolved by adding separator characters
 * in the furigana. These are only matched at the
 * boundaries between kanji and other kanji/kana.
 * So a regex created from 可愛い犬 should be able to match
 * か・わい・い・いぬ, but a regex created from 美味しい shouldn't
 * be able to match おいし・い.
 *
 * For purposes of this functions, only ASCII dots are
 * separators. Other characters are converted to dots in
 * the {@link cleanFurigana} function.
 *
 * The notation [可愛い犬]{か・わい・い・いぬ} forces us to
 * have separate \<rt\> tags for 可 and 愛. If we want to
 * indicate that か corresponds to 可 and わい corresponds to 愛
 * while keeping them under a single \<rt\> tag, we can use
 * a combinator instead of a separator, e.g.:
 * [可愛い犬]{か+わい・い・いぬ}
 *
 * For purposes of this functions, only ASCII pluses are
 * combinators. Other characters are converted to pluses in
 * the {@link cleanFurigana} function.
 *
 * @param {string} body
 * @returns {(null|RegExp)} Null if the body contains no hiragana
 *     or kanji, otherwise a regex to be used on the furigana
 */
function bodyToRegex(body) {
  let regexStr = "";
  let lastType = "other";

  const combinatorOrSeparatorGroup = "([+.]?)";
  const combinatorOrSeparator = "[+.]?";
  const combinatorOnly = "\\.?";
  const furiganaGroup = "([^+.]+)";

  for (let i = 0; i < body.length; i++) {
    const c = body.charAt(i);
    if (kanjiRegex.test(c)) {
      if (lastType === "kanji") {
        regexStr += combinatorOrSeparatorGroup;
      } else if (lastType === "kana") {
        regexStr += combinatorOrSeparator;
      }

      regexStr += furiganaGroup;
      lastType = "kanji";
    } else if (kanaRegex.test(c)) {
      if (lastType == "kanji") {
        regexStr += combinatorOrSeparator;
      }
      regexStr += c;
      lastType = "kana";
    } else {
      if (lastType !== "other") {
        regexStr += combinatorOnly;
      }
      lastType = "other";
    }
  }

  if (regexStr === "") {
    return null;
  }
  return new RegExp(regexStr);
}

/**
 * For a ruby tag specified as [body]{toptext}, tries to find
 * the appropriate furigana in the toptext for every kanji
 * in the body.
 *
 * The result is a flat array where each part of the body
 * is followed by its corresponding furigana. Or, if no
 * such correspondence can be found, just [body, toptext]
 * is returned.
 *
 * @example
 * r = matchFurigana('美味しいご飯', 'おいしいごはん')
 * assert(r == ['美味', 'おい', 'しいご', '', '飯', 'はん'])
 *
 * @param {string} body
 * @param {string} toptext
 * @returns {string[]} Flat array of parts of the body followed
 *     by their corresponding furigana, or just [body, toptext]
 *     if no such correspondence exists.
 */
function matchFurigana(body, toptext) {
  const bodyRegex = bodyToRegex(body);
  if (bodyRegex === null) {
    return [body, toptext];
  }

  const match = bodyRegex.exec(cleanFurigana(toptext));
  if (match === null) {
    return [body, toptext];
  }

  let result = [];
  let curBodyPart = "";
  let curToptextPart = "";
  let matchIndex = 1;
  let lastType = "other";
  for (let i = 0; i < body.length; i++) {
    const c = body.charAt(i);

    if (kanjiRegex.test(c)) {
      if (lastType === "kana" || lastType === "other") {
        if (curBodyPart !== "") {
          result.push(curBodyPart, curToptextPart);
        }
        curBodyPart = c;
        curToptextPart = match[matchIndex++];
        lastType = "kanji";
        continue;
      }

      const connection = match[matchIndex++];
      if (connection === "+" || connection === "") {
        curBodyPart += c;
        curToptextPart += match[matchIndex++];
      } else {
        result.push(curBodyPart, curToptextPart);
        curBodyPart = c;
        curToptextPart = match[matchIndex++];
      }
    } else {
      if (lastType !== "kanji") {
        curBodyPart += c;
        continue;
      }

      result.push(curBodyPart, curToptextPart);
      curBodyPart = c;
      curToptextPart = "";

      if (kanaRegex.test(c)) {
        lastType = "kana";
      } else {
        lastType = "other";
      }
    }
  }

  result.push(curBodyPart, curToptextPart);
  return result;
}

/**
 * "Cleans" the furigana by converting all allowed
 * separators to ASCII dots and all allowed combinators
 * to ASCII pluses.
 *
 * The meaning of "separator" and "combinator" is
 * described in the {@link bodyToRegex} function.
 *
 * @param {string} furigana
 * @returns {string} Clean version of the furigana
 */
function cleanFurigana(furigana) {
  const separatorRegex = /[\s.．。・|｜/／]/g;
  const combinatorRegex = /[+＋]/g;

  furigana = furigana.replace(separatorRegex, ".");
  furigana = furigana.replace(combinatorRegex, "+");
  return furigana;
}

/**
 * Parallel to the {@link matchFurigana} function,
 * but instead of doing any matching it just adds
 * toptext to every character of the body. This
 * is intended to be used for emphasis dots, like
 * you sometimes see in manga.
 *
 * For this, toptext is expected to start with
 * an asterisk (ASCII or full-width), and the actual
 * marker that should be placed after every character
 * should follow afterward.
 *
 * If no marker is provided, a circle (●) is used.
 *
 * Since this is meant to mimic the return value of the
 * {@link matchFurigana} function, the result is just an array
 * of characters from the body followed by the marker.
 *
 * @example
 * r = rubifyEveryCharacter('だから', '*')
 * assert(r == ['だ', '●', 'か', '●', 'ら', '●'])
 *
 * @example
 * r = rubifyEveryCharacter('だから', '*+')
 * assert(r == ['だ', '+', 'か', '+', 'ら', '+'])
 *
 * @param {string} body
 * @param {string} toptext
 * @returns {string[]} Flat array of characters of the body,
 *     each one followed by the marker as specified in toptext
 */
function rubifyEveryCharacter(body, toptext) {
  let topmark = toptext.slice(1);
  if (topmark === "") {
    topmark = "●";
  }

  let result = [];
  for (let c of body) {
    result.push(c, topmark);
  }
  return result;
}

/**
 * Returns a function that's compatible for use with
 * markdown-it's inline ruler. The function is further
 * customizable via the options.
 *
 * Available options:
 * - fallbackParens: fallback parentheses for the resulting
 *     \<ruby\> tags. Default value: "【】".
 *
 * @param {Object} options
 */
function furigana(options = {}) {
  options.fallbackParens = options.fallbackParens || "【】";

  return function(state, silent) {
    return process(state, silent, options);
  };
}

/**
 * Processes furigana by converting [kanji]{furigana}
 * into required markdown-it tokens. This is meant to be
 * hooked up to markdown-it's inline ruleset.
 *
 * Refer to {@link furigana} for available options.
 *
 * @param {*} state InlineState of the markdown-it processor
 * @param {boolean} silent If true, no tokens are actually generated
 * @param {Object} options
 * @returns {boolean} Whether the function successfully processed the text
 */
function process(state, silent, options) {
  const ruby = rubyHelper.parse(state);
  if (ruby === null) {
    return false;
  }

  state.pos = ruby.nextPos;

  if (silent) {
    return true;
  }

  const emphasisDotsIndicatorRegex = /[*＊].?/;
  if (emphasisDotsIndicatorRegex.test(ruby.toptext)) {
    const content = rubifyEveryCharacter(ruby.body, ruby.toptext);
    rubyHelper.addTag(state, content);
  } else {
    const content = matchFurigana(ruby.body, ruby.toptext);
    rubyHelper.addTag(state, content, options.fallbackParens);
  }

  return true;
}
