import { assertEquals } from "@std/assert/equals";
import { divideTokenWithOffset, Repetition } from "./Repetition.ts";
import { parameterizedTest } from "../../tests/testUtil.ts";

const p = (nDay: number) => ({ type: "period", period: nDay }) as const;
const s = (values: number[]) => ({ type: "specific", values }) as const;
const all = [0, 1, 2, 3, 4, 5, 6];

Deno.test("fromRepetitionsStr: 1つの条件を指定できる", () => {
  const actual = Repetition.fromRepetitionsStr("non workday");
  assertEquals(actual.length, 1);

  assertEquals(actual[0].day, p(1));
  assertEquals(actual[0].dayOfWeek, [0, 6]);
  assertEquals(actual[0].dayOfWeekHoliday, all);
  assertEquals(actual[0].week, p(1));
  assertEquals(actual[0].month, p(1));
  assertEquals(actual[0].dayOffset, 0);
  assertEquals(actual[0].workdayOffset, 0);
  assertEquals(actual[0].special, undefined);
});

Deno.test("fromRepetitionsStr: 2つの条件を指定できる", () => {
  const actual = Repetition.fromRepetitionsStr("non workday|tue/wed");
  assertEquals(actual.length, 2);

  assertEquals(actual[0].day, p(1));
  assertEquals(actual[0].dayOfWeek, [0, 6]);
  assertEquals(actual[0].dayOfWeekHoliday, all);
  assertEquals(actual[0].week, p(1));
  assertEquals(actual[0].month, p(1));
  assertEquals(actual[0].dayOffset, 0);
  assertEquals(actual[0].workdayOffset, 0);
  assertEquals(actual[0].special, undefined);

  assertEquals(actual[1].day, p(1));
  assertEquals(actual[1].dayOfWeek, [2, 3]);
  assertEquals(actual[1].dayOfWeekHoliday, [2, 3]);
  assertEquals(actual[1].week, p(1));
  assertEquals(actual[1].month, p(1));
  assertEquals(actual[1].dayOffset, 0);
  assertEquals(actual[1].workdayOffset, 0);
  assertEquals(actual[1].special, undefined);
});

Deno.test("fromRepetitionsStr: 3つの条件を指定できる", () => {
  const actual = Repetition.fromRepetitionsStr("non workday|tue/wed|15d");
  assertEquals(actual.length, 3);

  assertEquals(actual[0].day, p(1));
  assertEquals(actual[0].dayOfWeek, [0, 6]);
  assertEquals(actual[0].dayOfWeekHoliday, all);
  assertEquals(actual[0].week, p(1));
  assertEquals(actual[0].month, p(1));
  assertEquals(actual[0].dayOffset, 0);
  assertEquals(actual[0].workdayOffset, 0);
  assertEquals(actual[0].special, undefined);

  assertEquals(actual[1].day, p(1));
  assertEquals(actual[1].dayOfWeek, [2, 3]);
  assertEquals(actual[1].dayOfWeekHoliday, [2, 3]);
  assertEquals(actual[1].week, p(1));
  assertEquals(actual[1].month, p(1));
  assertEquals(actual[1].dayOffset, 0);
  assertEquals(actual[1].workdayOffset, 0);
  assertEquals(actual[1].special, undefined);

  assertEquals(actual[2].day, s([15]));
  assertEquals(actual[2].dayOfWeek, all);
  assertEquals(actual[2].dayOfWeekHoliday, all);
  assertEquals(actual[2].week, p(1));
  assertEquals(actual[2].month, p(1));
  assertEquals(actual[2].dayOffset, 0);
  assertEquals(actual[2].workdayOffset, 0);
  assertEquals(actual[2].special, undefined);
});

parameterizedTest(
  "from",
  // deno-fmt-ignore
  // prettier-ignore
  //  value                        | day         | dayOfWeek       | dayOfWeekHoliday | week | month   | dayO| workdayO | workdayShift | special
  [
    // 定型
    [ "every day"                  , p(1)        , all             , all              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "weekday"                    , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "weekend"                    , p(1)        , [0, 6]          , [0, 6]           , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "workday"                    , p(1)        , [1, 2, 3, 4, 5] , []               , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "non workday"                , p(1)        , [0, 6]          , all              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "every 3 day"                , p(3)        , all             , all              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    // 曜日
    [ "sun"                        , p(1)        , [0]             , [0]              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "sun/mon"                    , p(1)        , [0, 1]          , [0, 1]           , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "tue/wed/thu/fri/sat"        , p(1)        , [2, 3, 4, 5, 6] , [2, 3, 4, 5, 6]  , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "1sun/2mon/tue"              , p(1)        , [10, 21, 2]     , [10, 21, 2]      , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    // 曜日(休日ではない)
    [ "sun!"                       , p(1)        , [0]             , []               , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "sun!/mon!"                  , p(1)        , [0, 1]          , []               , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "tue!/wed!/thu!/fri!/sat!"   , p(1)        , [2, 3, 4, 5, 6] , []               , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "1sun!/2mon!/tue!"           , p(1)        , [10, 21, 2]     , []               , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    // 曜日(休日)
    [ "sun*"                       , p(1)        , []              , [0]              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "sun*/mon*"                  , p(1)        , []              , [0, 1]           , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "tue*/wed*/thu*/fri*/sat*"   , p(1)        , []              , [2, 3, 4, 5, 6]  , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "1sun*/2mon*/tue*"           , p(1)        , []              , [10, 21, 2]      , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    // 曜日(混合)
    [ "sun!/mon"                   , p(1)        , [0, 1]          , [1]              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "sun!/mon/2tue*/5wed!"       , p(1)        , [0, 1, 53]      , [1, 22]          , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    // 日付指定
    [ "10d"                        , s([10])     , all             , all              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    [ "10d/20d"                    , s([10, 20]) , all             , all              , p(1) , p(1)    , 0   , 0        , undefined    , undefined            ],
    // 月日指定
    [ "0728"                       , s([28])     , all             , all              , p(1) , s([7])  , 0   , 0        , undefined    , undefined            ],
    [ "1001"                       , s([1])      , all             , all              , p(1) , s([10]) , 0   , 0        , undefined    , undefined            ],
    [ "0101"                       , s([1])      , all             , all              , p(1) , s([1])  , 0   , 0        , undefined    , undefined            ],
    [ "1231"                       , s([31])     , all             , all              , p(1) , s([12]) , 0   , 0        , undefined    , undefined            ],
    // オフセット
    [ "weekday<1"                  , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)    , -1  , 0        , undefined    , undefined            ],
    [ "weekday>2"                  , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)    , 2   , 0        , undefined    , undefined            ],
    [ "1sun!/2mon!/tue!<1"         , p(1)        , [10, 21, 2]     , []               , p(1) , p(1)    , -1  , 0        , undefined    , undefined            ],
    [ "1sun*/2mon*/tue*<1"         , p(1)        , []              , [10, 21, 2]      , p(1) , p(1)    , -1  , 0        , undefined    , undefined            ],
    // オフセット(稼働日)
    [ "weekday<1!"                 , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)    , 0   , -1       , undefined    , undefined            ],
    [ "weekday>2!"                 , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)    , 0   , 2        , undefined    , undefined            ],
    [ "1sun!/2mon!/tue!<1!"        , p(1)        , [10, 21, 2]     , []               , p(1) , p(1)    , 0   , -1       , undefined    , undefined            ],
    [ "1sun*/2mon*/tue*<1!"        , p(1)        , []              , [10, 21, 2]      , p(1) , p(1)    , 0   , -1       , undefined    , undefined            ],
    // 稼働日シフト
    [ "10d>!"                      , s([10])     , all             , all              , p(1) , p(1)    , 0   , 0        , "next"       , undefined            ],
    [ "10d<!"                      , s([10])     , all             , all              , p(1) , p(1)    , 0   , 0        , "prev"       , undefined            ],
    // 特殊
    [ "end of month"               , p(1)        , all             , all              , p(1) , p(1)    , 0   , 0        , undefined    , "end of month"       ],
    [ "workday end of month"       , p(1)        , [1, 2, 3, 4, 5] , []               , p(1) , p(1)    , 0   , 0        , undefined    , "end of month"       ],
    [ "beginning of month"         , p(1)        , all             , all              , p(1) , p(1)    , 0   , 0        , undefined    , "beginning of month" ],
    [ "workday beginning of month" , p(1)        , [1, 2, 3, 4, 5] , []               , p(1) , p(1)    , 0   , 0        , undefined    , "beginning of month" ],
  ] as const,
  ([
    value,
    day,
    dayOfWeek,
    dayOfWeekHoliday,
    week,
    month,
    dayOffset,
    workdayOffset,
    workdayShift,
    special,
  ]) => {
    const actual = Repetition.from(value);

    assertEquals(actual?.day, day);
    assertEquals(actual?.dayOfWeek, dayOfWeek);
    assertEquals(actual?.dayOfWeekHoliday, dayOfWeekHoliday);
    assertEquals(actual?.week, week);
    assertEquals(actual?.month, month);
    assertEquals(actual?.dayOffset, dayOffset);
    assertEquals(actual?.workdayOffset, workdayOffset);
    assertEquals(actual?.workdayShift, workdayShift);
    assertEquals(actual?.special, special);
  },
);

parameterizedTest<
  [
    Parameters<typeof divideTokenWithOffset>[0],
    ReturnType<typeof divideTokenWithOffset>,
  ]
>(
  "divideTokenWithOffset",
  // deno-fmt-ignore
  // prettier-ignore
  //  token             | expected
  [
    // 〇日前後
    [ "wed<1"           , ["wed", -1, 0, undefined]],
    [ "wed>1"           , ["wed", 1, 0, undefined]],
    [ "wed<2"           , ["wed", -2, 0, undefined]],
    [ "wed>2"           , ["wed", 2, 0, undefined]],
    // 〇稼働日前後
    [ "wed<1!"          , ["wed", 0, -1, undefined]],
    [ "wed>1!"          , ["wed", 0, 1, undefined]],
    [ "wed<2!"          , ["wed", 0, -2, undefined]],
    [ "wed>2!"          , ["wed", 0, 2, undefined]],
    // 稼働日シフト
    [ "wed>!"           , ["wed", 0, 0, "next"]],
    [ "wed<!"           , ["wed", 0, 0, "prev"]],
  ] as const,
  ([token, expected]) => {
    assertEquals(divideTokenWithOffset(token), [...expected]);
  },
);
