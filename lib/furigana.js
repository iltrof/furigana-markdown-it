"use strict";

const rubyHelper = require("./ruby");

const kanaRegex = /[\u3040-\u3096\u30a1-\u30fa\uff66-\uff9dー]/;
const kanjiRegex = /[\u3400-\u9faf]/;
const separatorRegex = /[\s.．。・|｜/／]/g;
const combinatorRegex = /[+＋]/g;

function bodyToRegex(body) {
  let regexStr = "";
  let lastType = "other";

  for (let i = 0; i < body.length; i++) {
    const c = body.charAt(i);
    if (kanjiRegex.test(c)) {
      if (lastType === "kanji") {
        regexStr += "([+.]?)";
      } else if (lastType === "kana") {
        regexStr += "[+.]?";
      }

      regexStr += "([^+.]+)";
      lastType = "kanji";
    } else if (kanaRegex.test(c)) {
      if (lastType == "kanji") {
        regexStr += "[+.]?";
      }
      regexStr += c;
      lastType = "kana";
    } else {
      if (lastType !== "other") {
        regexStr += "\\.?";
      }
      lastType = "other";
    }
  }

  if (regexStr === "") {
    return null;
  }
  return new RegExp(regexStr);
}

function cleanFurigana(furigana) {
  furigana = furigana.replace(separatorRegex, ".");
  furigana = furigana.replace(combinatorRegex, "+");
  return furigana;
}

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

module.exports = function process(state, silent) {
  const ruby = rubyHelper.parse(state);
  if (ruby === null) {
    return false;
  }

  state.pos = ruby.nextPos;

  if (silent) {
    return true;
  }

  const content = matchFurigana(ruby.body, ruby.toptext);
  rubyHelper.addTag(state, content);
  return true;
};
