# furigana-markdown-it

A [markdown-it](https://github.com/markdown-it/markdown-it)
plugin which adds furigana support.

If you're reading this on npm, try
[github](https://github.com/iltrof/furigana-markdown-it)
instead: npm doesn't render `<ruby>` tags.

## TOC

- [Setup](#setup)
- [Quick usage](#quick-usage)
- [Not so quick usage](#not-so-quick-usage)
- [Options](#options)

## Setup

Install via npm:

```bash
npm install furigana-markdown-it
```

Use with markdown-it:

```js
const furigana = require("furigana-markdown-it")();
const md = require("markdown-it")().use(furigana);

const html = md.render("[猫]{ねこ}");
// html == <p><ruby>猫<rp>【</rp><rt>ねこ</rt><rp>】</rp></ruby></p>
```

Provide some options if you need (described below):

```js
const furigana = require("furigana-markdown-it")({
  fallbackParens: "()",
  extraSeparators: "-",
  extraCombinators: "'"
});
...
```

## Quick usage

Works:

| Input                                                                                                 | Result                                                                                                                                            | As image                                                                             |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `[漢字]{かんじ}`                                                                                      | <ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby><br> Or, if `<ruby>` is unsupported: <br> 漢字【かんじ】                                    | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/1.png)  |
| `[漢字]{かん・じ}`<br> (allowed separator characters: ".．。・\|｜/／", as well as any kind of space) | <ruby>漢<rp>【</rp><rt>かん</rt><rp>】</rp>字<rp>【</rp><rt>じ</rt><rp>】</rp></ruby><br> Or, if `<ruby>` is unsupported: <br> 漢【かん】字【じ】 | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/2.png)  |
| `[取り返す]{とりかえす}`                                                                              | <ruby>取<rp>【</rp><rt>と</rt><rp>】</rp>り<rt></rt>返<rp>【</rp><rt>かえ</rt><rp>】</rp>す<rt></rt></ruby>                                       | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/3.png)  |
| `[可愛い犬]{かわいいいぬ}`                                                                            | <ruby>可愛<rp>【</rp><rt>かわいい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>ぬ</rt><rp>】</rp></ruby> (wrong match!)                             | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/4.png)  |
| `[可愛い犬]{か・わい・いいぬ}`                                                                        | <ruby>可<rp>【</rp><rt>か</rt><rp>】</rp>愛<rp>【</rp><rt>わい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>             | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/5.png)  |
| `[可愛い犬]{か＋わい・いいぬ}`                                                                        | <ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>                                            | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/6.png)  |
| `[食べる]{たべる}`                                                                                    | <ruby>食<rp>【</rp><rt>た</rt><rp>】</rp>べる<rt></rt></ruby>                                                                                     | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/7.png)  |
| `[食べる]{=たべる}`                                                                                   | <ruby>食べる<rp>【</rp><rt>たべる</rt><rp>】</rp></ruby>                                                                                          | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/8.png)  |
| `[アクセラレータ]{accelerator}`                                                                       | <ruby>アクセラレータ<rp>【</rp><rt>accelerator</rt><rp>】</rp></ruby>                                                                             | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/9.png)  |
| `[accelerator]{アクセラレータ}`                                                                       | <ruby>accelerator<rp>【</rp><rt>アクセラレータ</rt><rp>】</rp></ruby>                                                                             | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/10.png) |
| `[あいうえお]{*}` (or `{＊}`)                                                                         | <ruby>あ<rt>●</rt>い<rt>●</rt>う<rt>●</rt>え<rt>●</rt>お<rt>●</rt></ruby>                                                                         | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/11.png) |
| `[あいうえお]{*❤}` (or `{＊❤}`)                                                                       | <ruby>あ<rt>❤</rt>い<rt>❤</rt>う<rt>❤</rt>え<rt>❤</rt>お<rt>❤</rt></ruby>                                                                         | ![](https://raw.githubusercontent.com/iltrof/furigana-markdown-it/master/img/12.png) |

Doesn't work 😞:

- Formatting: `[**漢字**]{かんじ}` doesn't make 漢字 bold.
- Matching katakana with hiragana: `[バカな奴]{ばかなやつ}` won't recognize that バカ and ばか are the same thing.
- Matching punctuation (or any other symbols): `[「はい」と言った]{「はい」といった}` will break on the 「」 brackets.

## Not so quick usage

The basic syntax is `[kanji]{furigana}`, which results in
a `<ruby>` tag, with the `kanji` part being the main
content of the ruby, and the `furigana` part being the
annotation.

In other words, `[漢字]{かんじ}` turns into
<ruby>漢字<rp>【</rp><rt>かんじ</rt><rp>】</rp></ruby>.

The plugin also generates fallback parentheses for
contexts where `<ruby>` tags happen to be unsupported. So
a browser that doesn't know about `<ruby>` tags would
display `[漢字]{かんじ}` as 漢字【かんじ】. The parentheses used can be
changed with the `fallbackParens` option when
initializing the plugin.

Annotating each kanji separately would be annoying, so
the plugin is also able to handle mixed kanji and kana.
For example, `[取り返す]{とりかえす}` correctly becomes
<ruby>取<rp>【</rp><rt>と</rt><rp>】</rp>り<rt></rt>返<rp>【</rp><rt>かえ</rt><rp>】</rp>す<rt></rt></ruby>.
In a browser without `<ruby>` support it would look like
取【と】り返【かえ】す.

When relying on the above functionality, please keep in
mind that hiragana and katakana are treated separately.
So something like `[バカな奴]{ばかなやつ}` wouldn't work, and
neither would `[ばかな奴]{バカなやつ}`, because the plugin doesn't
consider ばか and バカ to be the same.

In some cases there's no unambiguous way to match
furigana to its kanji. Consider `[可愛い犬]{かわいいいぬ}`. Here
the plugin naively assigns かわいい to 可愛, and ぬ to 犬. The
desired result, however, is to have かわい assigned to 可愛,
and いぬ to 犬.

To resolve such ambiguities it's possible to indicate
where the kanji boundaries should be, like this:
`[可愛い犬]{か・わい・いいぬ}`. This is enough to leave us with only
one possible configuration:
<ruby>可<rp>【</rp><rt>か</rt><rp>】</rp>愛<rp>【</rp><rt>わい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>.

To indicate kanji boundaries you can use any space
character, as well as the following: ".．。・|｜/／". To use
other characters for this purpose, specify them in the
`extraSeparators` option when initializing the plugin.

Nonetheless, `[可愛い犬]{か・わい・いいぬ}` leaves us with another
problem. We were forced to separately annotate 可 with か,
and 愛 with わい. Instead it would be preferable to have 可愛
as a single entity with the furigana かわい. However, the ・
dot between か and わい is required to resolve the
ambiguity.

The solution to this problem is to use a + plus instead
of a ・ dot, like this: `[可愛い犬]{か+わい・いいぬ}`. This still
indicated that there is a kanji boundary between か and
わい, but tells the plugin not to separate 可愛 in the final
result:
<ruby>可愛<rp>【</rp><rt>かわい</rt><rp>】</rp>い<rt></rt>犬<rp>【</rp><rt>いぬ</rt><rp>】</rp></ruby>.

Instead of the ASCII plus (+) you can also use a full-width
plus (＋). If you need any other characters to act as these
pluses, specify them in the `extraCombinators` option
when initializing the plugin.

_If you feel so inclined_, you can also let the plugin
match entire sentences:
`[お前は、もう死んでいる]{おまえはもうしんでいる}` produces
<ruby>お<rt></rt>前<rp>【</rp><rt>まえ</rt><rp>】</rp>は、もう<rt></rt>死<rp>【</rp><rt>し</rt><rp>】</rp>んでいる<rt></rt></ruby>.
However, **don't** put any punctuation into the furigana
part.

Other than pure Japanese, you should also get reliable
results out of:

- English annotations to kana:
  - `[ネコ]{cat}` becomes
    <ruby>ネコ<rp>【</rp><rt>cat</rt><rp>】</rp></ruby>.
  - `[ねこ]{cat}` becomes
    <ruby>ねこ<rp>【</rp><rt>cat</rt><rp>】</rp></ruby>.
- English annotations to kanji (without kana):
  - `[漢字]{kanji}` becomes
    <ruby>漢字<rp>【</rp><rt>kanji</rt><rp>】</rp></ruby>
  - And even `[漢字]{kan・ji}` becomes
    <ruby>漢<rp>【</rp><rt>kan</rt><rp>】</rp>字<rp>【</rp><rt>ji</rt><rp>】</rp></ruby>
- Japanese annotations to English:
  - All of `[cat]{ねこ}`, `[cat]{ネコ}`, `[cat]{猫}` work as
    you'd expect.
- English annotations to English:
  - `[sorry]{not sorry}` becomes
    <ruby>sorry<rp>【</rp><rt>not
    sorry</rt><rp>】</rp></ruby>.

If you want to bypass furigana matching and just stick
the annotation on top of the text as-is, add an equals
sign after the opening curly brace. For example,
`[食べる]{=たべる}` produces
<ruby>食べる<rp>【</rp><rt>たべる</rt><rp>】</rp></ruby>.

The above notation accepts both the ASCII equals sign (=) and the full-width equals sign (＝).

**Bonus time!**

Ever wanted to spice up your Japanese sentences with
<ruby>em<rt>●</rt>pha<rt>●</rt>sis<rt>●</rt>&nbsp;<rt></rt>dots<rt>●</rt></ruby>?
Worry no more: `[あいうえお]{*}` will do just that:
<ruby>あ<rt>●</rt>い<rt>●</rt>う<rt>●</rt>え<rt>●</rt>お<rt>●</rt></ruby>!

And if you don't like the default look, provide a custom
character (or several) after the asterisk, like this:
`[あいうえお]{*+}` (result:
<ruby>あ<rt>+</rt>い<rt>+</rt>う<rt>+</rt>え<rt>+</rt>お<rt>+</rt></ruby>).

Of couse, the full-width asterisk (＊) also works.

## Options

Options can be provided during initialization of the plugin:

```js
const furigana = require("furigana-markdown-it")({
  fallbackParens: "()",
  extraSeparators: "-",
  extraCombinators: "'"
});
```

Supported options:

- `fallbackParens`: fallback parentheses to use in
  contexts where `<ruby>` tags are unavailable. By default
  the plugin uses 【】 for fallback, so `[漢字]{かんじ}` becomes
  漢字【かんじ】 on a rare browser without `<ruby>` support.

  This option takes a string with the opening bracket followed by the closing bracket.

- `extraSeparators`: separators are characters that allow
  you to split furigana between individual kanji (read the
  usage section). Any kind of space is a separator, as well
  as these characters: ".．。・|｜/／".

  If you want additional characters to act as separators,
  provide them with this option.

- `extraCombinators`: combinators are characters that
  allow you to indicate a kanji boundary without actually
  splitting the furigana between these kanji (read the
  usage section).

  Default combinators are + and ＋. If you need additional
  combinator characters, provide them with this option.
