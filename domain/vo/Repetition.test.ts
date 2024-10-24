import { assertEquals } from "@std/assert/equals";
import { Repetition } from "./Repetition.ts";
import { parameterizedTest } from "../../tests/testUtil.ts";

const p = (nDay: number) => ({ type: "period", period: nDay }) as const;
const s = (days: number[]) => ({ type: "specific", values: days }) as const;
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
  //  value                        | day         | dayOfWeek       | dayOfWeekHoliday | week | month | dayOffset | workdayOffset | special
  [
    [ "every day"                  , p(1)        , all             , all              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "weekday"                    , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "weekend"                    , p(1)        , [0, 6]          , [0, 6]           , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "workday"                    , p(1)        , [1, 2, 3, 4, 5] , []               , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "non workday"                , p(1)        , [0, 6]          , all              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun"                        , p(1)        , [0]             , [0]              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun/mon"                    , p(1)        , [0, 1]          , [0, 1]           , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "tue/wed/thu/fri/sat"        , p(1)        , [2, 3, 4, 5, 6] , [2, 3, 4, 5, 6]  , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "1sun/2mon/tue"              , p(1)        , [10, 21, 2]     , [10, 21, 2]      , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun!"                       , p(1)        , [0]             , []               , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun!/mon!"                  , p(1)        , [0, 1]          , []               , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "tue!/wed!/thu!/fri!/sat!"   , p(1)        , [2, 3, 4, 5, 6] , []               , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "1sun!/2mon!/tue!"           , p(1)        , [10, 21, 2]     , []               , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun*"                       , p(1)        , []              , [0]              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun*/mon*"                  , p(1)        , []              , [0, 1]           , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "tue*/wed*/thu*/fri*/sat*"   , p(1)        , []              , [2, 3, 4, 5, 6]  , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "1sun*/2mon*/tue*"           , p(1)        , []              , [10, 21, 2]      , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun!/mon"                   , p(1)        , [0, 1]          , [1]              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "sun!/mon/2tue*/5wed!"       , p(1)        , [0, 1, 53]      , [1, 22]          , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "10d"                        , s([10])     , all             , all              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "10d/20d"                    , s([10, 20]) , all             , all              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "every 3 day"                , p(3)        , all             , all              , p(1) , p(1)  , 0         , 0             , undefined            ],
    [ "weekday<1"                  , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)  , -1        , 0             , undefined            ],
    [ "weekday>2"                  , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)  , 2         , 0             , undefined            ],
    [ "1sun!/2mon!/tue!<1"         , p(1)        , [10, 21, 2]     , []               , p(1) , p(1)  , -1        , 0             , undefined            ],
    [ "1sun*/2mon*/tue*<1"         , p(1)        , []              , [10, 21, 2]      , p(1) , p(1)  , -1        , 0             , undefined            ],
    [ "weekday<1!"                 , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)  , 0         , -1            , undefined            ],
    [ "weekday>2!"                 , p(1)        , [1, 2, 3, 4, 5] , [1, 2, 3, 4, 5]  , p(1) , p(1)  , 0         , 2             , undefined            ],
    [ "1sun!/2mon!/tue!<1!"        , p(1)        , [10, 21, 2]     , []               , p(1) , p(1)  , 0         , -1            , undefined            ],
    [ "1sun*/2mon*/tue*<1!"        , p(1)        , []              , [10, 21, 2]      , p(1) , p(1)  , 0         , -1            , undefined            ],
    [ "end of month"               , p(1)        , all             , all              , p(1) , p(1)  , 0         , 0             , "end of month"       ],
    [ "workday end of month"       , p(1)        , [1, 2, 3, 4, 5] , []               , p(1) , p(1)  , 0         , 0             , "end of month"       ],
    [ "beginning of month"         , p(1)        , all             , all              , p(1) , p(1)  , 0         , 0             , "beginning of month" ],
    [ "workday beginning of month" , p(1)        , [1, 2, 3, 4, 5] , []               , p(1) , p(1)  , 0         , 0             , "beginning of month" ],
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
    assertEquals(actual?.special, special);
  },
);
