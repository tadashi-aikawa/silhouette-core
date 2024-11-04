import { assertEquals } from "@std/assert/equals";
import { parameterizedTest } from "../tests/testUtil.ts";
import { uniq } from "./collections.ts";

parameterizedTest<[Parameters<typeof uniq>[0], ReturnType<typeof uniq>]>(
  "uniq",
  // deno-fmt-ignore
  // prettier-ignore
  [
    [  ["a", "b", "a"], ["a", "b"]],
    [  ["a", "b", "c"], ["a", "b", "c"]],
    [  ["a", "a", "a"], ["a"]],
  ] as const,
  ([values, expected]) => {
    assertEquals(uniq(values), expected);
  },
);
