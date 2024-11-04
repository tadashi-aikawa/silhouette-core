import { assertEquals } from "@std/assert/equals";
import { parameterizedTest } from "../tests/testUtil.ts";
import { match } from "./strings.ts";

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
