"use strict";

const assert = require("assert");
const md = require("markdown-it")().use(require("../index")());

describe("ruby", function() {
  it("should parse basic [body]{toptext}", function() {
    assert.equal(
      md.renderInline("[漢字]{かんじ}"),
      "<ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby>"
    );
  });

  it("should parse single [body]{toptext} in a sentence", function() {
    assert.equal(
      md.renderInline("Foo [漢字]{かんじ} bar."),
      "Foo <ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby> bar."
    );
  });

  it("should parse multiple [body]{toptext} in a sentence", function() {
    assert.equal(
      md.renderInline("Foo [漢字]{かんじ} bar [猫]{ねこ} baz."),
      "Foo <ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby> bar <ruby>猫<rp>【</rp><rt>ねこ</rt><rp>】</rp></ruby> baz."
    );
  });

  it("should ignore empty body", function() {
    assert.equal(md.renderInline("[]{ねこ}"), "[]{ねこ}");
    assert.equal(md.renderInline("[ ]{ねこ}"), "[ ]{ねこ}");
  });

  it("should ignore empty toptext", function() {
    assert.equal(md.renderInline("[猫]{}"), "[猫]{}");
    assert.equal(md.renderInline("[猫]{ }"), "[猫]{ }");
  });
});

describe("furigana", function() {
  it("should be able to pattern match a single kanji+hiragana word", function() {
    assert.equal(
      md.renderInline("[食べる]{たべる}"),
      "<ruby>食<rp>【</rp><rt>た</rt><rp>】</rp>べる<rt></rt></ruby>"
    );
  });

  it("should be able to pattern match a word with hiragana in the middle", function() {
    assert.equal(
      md.renderInline("[取り返す]{とりかえす}"),
      "<ruby>取<rp>【</rp><rt>と</rt><rp>】</rp>り<rt></rt>返<rp>【</rp><rt>かえ</rt><rp>】</rp>す<rt></rt></ruby>"
    );
  });

  it("should be able to split furigana with a dot", function() {
    assert.equal(
      md.renderInline("[漢字]{かん.じ}"),
      "<ruby>漢<rp>【</rp><rt>かん</rt><rp>】</rp>字<rp>【</rp><rt>じ</rt><rp>】</rp></ruby>"
    );
  });

  it("should be able to use dots to resolve ambiguities", function() {
    assert.equal(
      md.renderInline("[可愛い犬]{か.わい.い.いぬ}"),
      "<ruby>可<rp>【</rp><rt>か</rt><rp>】</rp>愛<rp>【</rp><rt>わい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
  });

  it("should be able to use pluses to resolve ambiguities without splitting furigana", function() {
    assert.equal(
      md.renderInline("[可愛い犬]{か+わい.い.いぬ}"),
      "<ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
  });

  it("should be able to handle symbols other than kanji and kana in the body", function() {
    assert.equal(
      md.renderInline("[猫！？可愛い！！！w]{ねこ.かわいい}"),
      "<ruby>猫<rp>【</rp><rt>ねこ</rt><rp>】</rp>！？<rt></rt>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い！！！w<rt></rt></ruby>"
    );
  });

  it("should apply the whole toptext to the whole body if it can't pattern match", function() {
    assert.equal(
      md.renderInline("[食べる]{たべべ}"),
      "<ruby>食べる<rp>【</rp><rt>たべべ</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[アクセラレーター]{accelerator}"),
      "<ruby>アクセラレーター<rp>【</rp><rt>accelerator</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[cat]{ねこ}"),
      "<ruby>cat<rp>【</rp><rt>ねこ</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[可愛い]{kawaii}"),
      "<ruby>可愛い<rp>【</rp><rt>kawaii</rt><rp>】</rp></ruby>"
    );
  });

  it("should accept a few other separators other than ASCII dot", function() {
    assert.equal(
      md.renderInline(
        "[犬犬犬犬犬犬犬犬犬犬犬]{いぬ.いぬ．いぬ。いぬ・いぬ|いぬ｜いぬ/いぬ／いぬ いぬ　いぬ}"
      ),
      "<ruby>" + "犬<rp>【</rp><rt>いぬ</rt><rp>】</rp>".repeat(11) + "</ruby>"
    );
  });

  it("should accept full-width plus as combinator", function() {
    assert.equal(
      md.renderInline("[可愛い犬]{か＋わい.い.いぬ}"),
      "<ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
  });

  it("should accept furigana in romaji, as long as body is kanji-only", function() {
    assert.equal(
      md.renderInline("[漢字]{kan.ji}"),
      "<ruby>漢<rp>【</rp><rt>kan</rt><rp>】</rp>字<rp>【</rp><rt>ji</rt><rp>】</rp></ruby>"
    );
  });

  it("should disable pattern matching if toptext starts with an equals sign", function() {
    assert.equal(
      md.renderInline("[食べる]{=たべる}"),
      "<ruby>食べる<rp>【</rp><rt>たべる</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[食べる]{＝たべる}"),
      "<ruby>食べる<rp>【</rp><rt>たべる</rt><rp>】</rp></ruby>"
    );
  });

  it("should NOT disable pattern matching if = appears not in the beginning", function() {
    assert.equal(
      md.renderInline("[猫だ]{ね=こだ}"),
      "<ruby>猫<rp>【</rp><rt>ね=こ</rt><rp>】</rp>だ<rt></rt></ruby>"
    );
    assert.equal(
      md.renderInline("[猫だ]{ね＝こだ}"),
      "<ruby>猫<rp>【</rp><rt>ね＝こ</rt><rp>】</rp>だ<rt></rt></ruby>"
    );
  });

  it("should pattern match katakana", function() {
    assert.equal(
      md.renderInline("[ダメな奴]{ダメなやつ}"),
      "<ruby>ダメな<rt></rt>奴<rp>【</rp><rt>やつ</rt><rp>】</rp></ruby>"
    );
  });

  it("should pattern match half-width katakana", function() {
    assert.equal(
      md.renderInline("[ﾀﾞﾒな奴]{ﾀﾞﾒなやつ}"),
      "<ruby>ﾀﾞﾒな<rt></rt>奴<rp>【</rp><rt>やつ</rt><rp>】</rp></ruby>"
    );
  });

  it("should abort if body only partially matches the furigana", function() {
    assert.equal(
      md.renderInline("[猫だ]{ねこだよ}"),
      "<ruby>猫だ<rp>【</rp><rt>ねこだよ</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[は猫]{これはねこ}"),
      "<ruby>は猫<rp>【</rp><rt>これはねこ</rt><rp>】</rp></ruby>"
    );
  });
});

describe("emphasis dots", function() {
  it("should be applied with [body]{*}", function() {
    assert.equal(
      md.renderInline("[だから]{*}"),
      "<ruby>だ<rt>●</rt>か<rt>●</rt>ら<rt>●</rt></ruby>"
    );
  });

  it("should accept a full-width asterisk as well", function() {
    assert.equal(
      md.renderInline("[だから]{＊}"),
      "<ruby>だ<rt>●</rt>か<rt>●</rt>ら<rt>●</rt></ruby>"
    );
  });

  it("should accept custom markers", function() {
    assert.equal(
      md.renderInline("[だから]{*+}"),
      "<ruby>だ<rt>+</rt>か<rt>+</rt>ら<rt>+</rt></ruby>"
    );
  });

  it("should work on any character", function() {
    assert.equal(
      md.renderInline("[猫is❤]{*}"),
      "<ruby>猫<rt>●</rt>i<rt>●</rt>s<rt>●</rt>❤<rt>●</rt></ruby>"
    );
  });

  it("should NOT create emphasis dots if * appears not in the beginning", function() {
    assert.equal(
      md.renderInline("[猫だ]{ね*こだ}"),
      "<ruby>猫<rp>【</rp><rt>ね*こ</rt><rp>】</rp>だ<rt></rt></ruby>"
    );
    assert.equal(
      md.renderInline("[猫だ]{ね＊こだ}"),
      "<ruby>猫<rp>【</rp><rt>ね＊こ</rt><rp>】</rp>だ<rt></rt></ruby>"
    );
  });
});

describe("options", function() {
  it("should allow custom fallback parentheses", function() {
    let md = require("markdown-it")().use(
      require("../index")({ fallbackParens: "()" })
    );

    assert.equal(
      md.renderInline("[漢字]{かんじ}"),
      "<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>"
    );
  });

  it("should allow adding extra separators", function() {
    let md = require("markdown-it")().use(
      require("../index")({ extraSeparators: "_-\\]" })
    );

    assert.equal(
      md.renderInline("[犬犬犬犬犬犬犬]{いぬ.いぬ。いぬ_いぬ-いぬ\\いぬ]いぬ}"),
      "<ruby>" + "犬<rp>【</rp><rt>いぬ</rt><rp>】</rp>".repeat(7) + "</ruby>"
    );
  });

  it("should allow adding extra combinators", function() {
    let md = require("markdown-it")().use(
      require("../index")({ extraCombinators: "*" })
    );

    assert.equal(
      md.renderInline("[可愛い犬]{か+わい.い.いぬ}"),
      "<ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
    assert.equal(
      md.renderInline("[可愛い犬]{か*わい.い.いぬ}"),
      "<ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>"
    );
  });
});
