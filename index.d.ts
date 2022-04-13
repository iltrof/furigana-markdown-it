// Type definitions for furigana-markdown-it 1.0
// Project: https://github.com/iltrof/furigana-markdown-it#readme
// Definitions by: Piotr Błażejewicz <https://github.com/peterblazejewicz>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
import { PluginSimple } from 'markdown-it';

/**
 * A markdown-it plugin which adds furigana support.
 */
declare function furigana(options?: furigana.Options): PluginSimple;

declare namespace furigana {
    /**
     * Options can be provided during initialization of the plugin
     */
    interface Options {
        /**
         * fallback parentheses to use in contexts where <ruby> tags are unavailable.
         * By default the plugin uses 【】 for fallback,
         * so [漢字]{かんじ} becomes 漢字【かんじ】 on a rare browser without <ruby> support.
         *
         * This option takes a string with the opening bracket followed by the closing bracket.
         */
        fallbackParens?: string | undefined;

        /**
         * separators are characters that allow you to split furigana between individual kanji (read the usage section).
         * Any kind of space is a separator, as well as these characters: `.．。・|｜/／`.
         *
         * If you want additional characters to act as separators, provide them with this option.
         */
        extraSeparators?: string | undefined;

        /**
         * combinators are characters that allow you to indicate a kanji boundary
         * without actually splitting the furigana between these kanji (read the usage section).
         *
         * Default combinators are + and ＋.
         * If you need additional combinator characters, provide them with this option.
         */
        extraCombinators?: string | undefined;

        /**
         * The `lang` global attribute helps define the language of an element:
         * The attribute contains a single "language tag" in the format defined in RFC 5646:
         * Tags for Identifying Languages (also known as BCP 47).
         *
         * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang
         *
         * `lang` attribute may help define a proper variant of the same unicode point,
         * that are merged due to Han unification.
         *
         * @link https://en.wikipedia.org/wiki/Han_unification
         *
         * By default, lang attribute is absent in `<ruby>` tags.
         * If you need force certain locales (like "ja-JP" for Japanese), provide one with this option.
         */
        lang?: string | undefined;
    }
}

export = furigana;
