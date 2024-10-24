export function parameterizedTest<T>(
  name: string,
  cases: T[],
  testFn: (input: T) => void,
) {
  for (const testCase of cases) {
    Deno.test(`${name} -> ${JSON.stringify(testCase)}`, () => {
      testFn(testCase);
    });
  }
}
