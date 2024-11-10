import { assertEquals } from "@std/assert/equals";
import { parameterizedTest } from "../tests/testUtil.ts";
import { match, parseMarkdownList, pickPatterns } from "./strings.ts";

parameterizedTest(
  "match",
  [
    ["123", /\d+/, true],
    ["abc", /[a-z]+/, true],
    ["abc123cdf", /\d+/, false],
    ["abc123cdf", /[a-z]+/, false],
    ["abc123cdf", /^\d+/, false],
  ] as const,
  ([text, pattern, expected]) => {
    assertEquals(match(text, pattern), expected);
  },
);

parameterizedTest<
  [
    Parameters<typeof pickPatterns>[0],
    Parameters<typeof pickPatterns>[1],
    ReturnType<typeof pickPatterns>,
  ]
>(
  "function",
  // deno-fmt-ignore
  // prettier-ignore
  [
    ["- hoge hoge", /^- (?<name>.+)/g                      , { name: "hoge hoge" }],
    ["- 1ro 2ro"  , /^- (?<first>[^ ]+) (?<second>[^ ]+)/g , {first: "1ro", second: "2ro"}],
    ["* hoge hoge", /^- (?<name>.+)/g                      , {}],
  ] as const,
  ([str, pattern, expected]) => {
    assertEquals(pickPatterns(str, pattern), expected);
  },
);

parameterizedTest<
  [
    Parameters<typeof parseMarkdownList>[0],
    ReturnType<typeof parseMarkdownList>,
  ]
>(
  "function",
  // deno-fmt-ignore
  // prettier-ignore
  [
    [""              , { prefix: "", content: "" }],
    ["hoge"          , { prefix: "", content: "hoge" }],
    ["- "            , { prefix: "- ", content: "" }],
    ["- hoge"        , { prefix: "- ", content: "hoge" }],
    ["- [ ] hoge"    , { prefix: "- [ ] ", content: "hoge" }],
    ["- [x] hoge"    , { prefix: "- [x] ", content: "hoge" }],
    ["  hoge"        , { prefix: "  ", content: "hoge" }],
    ["  - "          , { prefix: "  - ", content: "" }],
    ["  - hoge"      , { prefix: "  - ", content: "hoge" }],
    ["  - [ ] hoge"  , { prefix: "  - [ ] ", content: "hoge" }],
    ["  - [x] hoge"  , { prefix: "  - [x] ", content: "hoge" }],
    ["* "            , { prefix: "* ", content: "" }],
    ["* hoge"        , { prefix: "* ", content: "hoge" }],
    ["* [ ] hoge"    , { prefix: "* [ ] ", content: "hoge" }],
    ["* [x] hoge"    , { prefix: "* [x] ", content: "hoge" }],
    ["\t- "          , { prefix: "\t- ", content: "" }],
    ["\t- hoge"      , { prefix: "\t- ", content: "hoge" }],
    ["\t- [ ] hoge"  , { prefix: "\t- [ ] ", content: "hoge" }],
    ["\t- [x] hoge"  , { prefix: "\t- [x] ", content: "hoge" }],
    ["\t\t- "        , { prefix: "\t\t- ", content: "" }],
    ["\t\t- hoge"    , { prefix: "\t\t- ", content: "hoge" }],
    ["\t\t- [ ] hoge", { prefix: "\t\t- [ ] ", content: "hoge" }],
    ["\t\t- [x] hoge", { prefix: "\t\t- [x] ", content: "hoge" }],
    ["　- "          , { prefix: "　- ", content: "" }],
    ["　- hoge"      , { prefix: "　- ", content: "hoge" }],
    ["　- [ ] hoge"  , { prefix: "　- [ ] ", content: "hoge" }],
    ["　- [x] hoge"  , { prefix: "　- [x] ", content: "hoge" }],
    ["　　- "        , { prefix: "　　- ", content: "" }],
    ["　　- hoge"    , { prefix: "　　- ", content: "hoge" }],
    ["　　- [ ] hoge", { prefix: "　　- [ ] ", content: "hoge" }],
    ["　　- [x] hoge", { prefix: "　　- [x] ", content: "hoge" }],
  ] as const,
  ([text, expected]) => {
    assertEquals(parseMarkdownList(text), expected);
  },
);
