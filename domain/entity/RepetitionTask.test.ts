import { DateTime } from "owlelia";
import { RepetitionTask, reverseOffsetWorkdays } from "./RepetitionTask.ts";
import { Repetition } from "../vo/Repetition.ts";
import { parameterizedTest } from "../../tests/testUtil.ts";
import { assertEquals } from "@std/assert/equals";

const d = DateTime.of;
const holidays = ["2023-01-01", "2023-01-04", "2023-03-01"];

// | 日付       | 曜 | 祝 | 平 | 土日 | 稼働日 |
// |------------|----|----|----|------|--------|
// | 2022/12/29 | 木 |    | O  |      | O      |
// | 2022/12/30 | 金 |    | O  |      | O      |
// | 2022/12/31 | 土 |    |    | O    |        |
// | 2023/01/01 | 日 | O  |    | O    |        |
// | 2023/01/02 | 月 |    | O  |      | O      |
// | 2023/01/03 | 火 |    | O  |      | O      |
// | 2023/01/04 | 水 | O  | O  |      |        |
// | 2023/01/05 | 木 |    | O  |      | O      |
// | 2023/01/06 | 金 |    | O  |      | O      |
// | 2023/01/07 | 土 |    |    | O    |        |
// | 2023/01/08 | 日 |    |    | O    |        |
// | 2023/01/09 | 月 |    | O  |      | O      |
// | 2023/01/10 | 火 |    | O  |      | O      |
// | 2023/01/11 | 水 |    | O  |      | O      |
// |            |    |    |    |      |        |
// | 2023/01/27 | 金 |    | O  |      | O      |
// | 2023/01/28 | 土 |    |    | O    |        |
// | 2023/01/29 | 日 |    |    | O    |        |
// | 2023/01/30 | 月 |    | O  |      | O      |
// | 2023/01/31 | 火 |    | O  |      | O      |
// | 2023/02/01 | 水 |    | O  |      | O      |
// | 2023/02/02 | 木 |    | O  |      | O      |
// |            |    |    |    |      |        |
// | 2023/02/27 | 月 |    | O  |      | O      |
// | 2023/02/28 | 火 |    | O  |      | O      |
// | 2023/03/01 | 水 | O  | O  |      |        |
// | 2023/03/02 | 木 |    | O  |      | O      |
// | 2023/03/03 | 金 |    | O  |      | O      |
// |            |    |    |    |      |        |
// | 2023/04/26 | 水 |    | O  |      | O      |
// | 2023/04/27 | 木 |    | O  |      | O      |
// | 2023/04/28 | 金 |    | O  |      | O      |
// | 2023/04/29 | 土 |    |    | O    |        |
// | 2023/04/30 | 日 |    |    | O    |        |
// | 2023/05/01 | 月 |    | O  |      | O      |
// | 2023/05/02 | 火 |    | O  |      | O      |
// |            |    |    |    |      |        |
// | 2023/06/29 | 木 |    | O  |      | O      |
// | 2023/06/30 | 金 |    | O  |      | O      |
// | 2023/07/01 | 土 |    |    | O    |        |
// | 2023/07/02 | 日 |    |    | O    |        |
// | 2023/07/03 | 月 |    | O  |      | O      |
// | 2023/07/04 | 火 |    | O  |      | O      |

parameterizedTest<
  [DateTime, string[], DateTime | undefined, string, boolean]
>(
  "shouldTry",
  // deno-fmt-ignore
  // prettier-ignore
  // no  |date       | holidays          | baseDate        | repetitionWord                  | expected
  [
    // -----------------------------------------------------------------------------------------------
    // 毎日
    // -----------------------------------------------------------------------------------------------
    [d("2022-12-31") , holidays          , undefined       , "every day"                     , true],
    [d("2022-12-31") , holidays          , undefined       , "every day>1"                   , true],
    [d("2022-12-31") , holidays          , undefined       , "every day<2"                   , true],
    [d("2023-01-01") , holidays          , undefined       , "every day"                     , true],
    [d("2023-01-02") , holidays          , undefined       , "every day"                     , true],
    [d("2023-01-04") , holidays          , undefined       , "every day"                     , true],

    // -----------------------------------------------------------------------------------------------
    // 平日
    // -----------------------------------------------------------------------------------------------
    [d("2022-12-31") , holidays          , undefined       , "weekday"                       , false],
    [d("2022-12-31") , holidays          , undefined       , "weekday>1"                     , true],
    [d("2022-12-31") , holidays          , undefined       , "weekday<2"                     , true],
    [d("2023-01-01") , holidays          , undefined       , "weekday"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "weekday>1"                     , false],
    [d("2023-01-01") , holidays          , undefined       , "weekday<2"                     , true],
    [d("2023-01-02") , holidays          , undefined       , "weekday"                       , true],
    [d("2023-01-02") , holidays          , undefined       , "weekday>1"                     , false],
    [d("2023-01-02") , holidays          , undefined       , "weekday<2"                     , true],
    [d("2023-01-04") , holidays          , undefined       , "weekday"                       , true],
    [d("2023-01-04") , holidays          , undefined       , "weekday>1"                     , true],
    [d("2023-01-04") , holidays          , undefined       , "weekday<2"                     , true],
    
    // -----------------------------------------------------------------------------------------------
    // 土日
    // -----------------------------------------------------------------------------------------------
    [d("2022-12-31") , holidays          , undefined       , "weekend"                       , true],
    [d("2022-12-31") , holidays          , undefined       , "weekend>1"                     , false],
    [d("2022-12-31") , holidays          , undefined       , "weekend<2"                     , false],
    [d("2023-01-01") , holidays          , undefined       , "weekend"                       , true],
    [d("2023-01-01") , holidays          , undefined       , "weekend>1"                     , true],
    [d("2023-01-01") , holidays          , undefined       , "weekend<2"                     , false],
    [d("2023-01-02") , holidays          , undefined       , "weekend"                       , false],
    [d("2023-01-02") , holidays          , undefined       , "weekend>1"                     , true],
    [d("2023-01-02") , holidays          , undefined       , "weekend<2"                     , false],
    [d("2023-01-04") , holidays          , undefined       , "weekend"                       , false],
    [d("2023-01-04") , holidays          , undefined       , "weekend>1"                     , false],
    [d("2023-01-04") , holidays          , undefined       , "weekend<2"                     , false],

    // -----------------------------------------------------------------------------------------------
    // 稼働日
    // -----------------------------------------------------------------------------------------------
    [d("2022-12-31") , holidays          , undefined       , "workday"                       , false],
    [d("2022-12-31") , holidays          , undefined       , "workday>1"                     , true],
    [d("2022-12-31") , holidays          , undefined       , "workday<2"                     , true],
    [d("2023-01-01") , holidays          , undefined       , "workday"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "workday>1"                     , false],
    [d("2023-01-01") , holidays          , undefined       , "workday<2"                     , true],
    [d("2023-01-02") , holidays          , undefined       , "workday"                       , true],
    [d("2023-01-02") , holidays          , undefined       , "workday>1"                     , false],
    [d("2023-01-02") , holidays          , undefined       , "workday<2"                     , false],
    [d("2023-01-04") , holidays          , undefined       , "workday"                       , false],
    [d("2023-01-04") , holidays          , undefined       , "workday>1"                     , true],
    [d("2023-01-04") , holidays          , undefined       , "workday<2"                     , true],

    // -----------------------------------------------------------------------------------------------
    // 稼働日ではない
    // -----------------------------------------------------------------------------------------------
    [d("2022-12-31") , holidays          , undefined       , "non workday"                   , true],
    [d("2022-12-31") , holidays          , undefined       , "non workday>1"                 , false],
    [d("2022-12-31") , holidays          , undefined       , "non workday<2"                 , false],
    [d("2022-12-31") , holidays          , undefined       , "non workday>1!"                , false],
    [d("2022-12-31") , holidays          , undefined       , "non workday<2!"                , false],
    [d("2023-01-01") , holidays          , undefined       , "non workday"                   , true],
    [d("2023-01-01") , holidays          , undefined       , "non workday>1"                 , true],
    [d("2023-01-01") , holidays          , undefined       , "non workday<2"                 , false],
    [d("2023-01-01") , holidays          , undefined       , "non workday>1!"                , false],
    [d("2023-01-01") , holidays          , undefined       , "non workday<!"                 , false],
    [d("2023-01-02") , holidays          , undefined       , "non workday"                   , false],
    [d("2023-01-02") , holidays          , undefined       , "non workday>1"                 , true],
    [d("2023-01-02") , holidays          , undefined       , "non workday<2"                 , true],
    [d("2023-01-02") , holidays          , undefined       , "non workday>1!"                , true],
    [d("2023-01-02") , holidays          , undefined       , "non workday<2!"                , true],
    [d("2023-01-04") , holidays          , undefined       , "non workday"                   , true],
    [d("2023-01-04") , holidays          , undefined       , "non workday>1"                 , false],
    [d("2023-01-04") , holidays          , undefined       , "non workday<2"                 , false],
    [d("2023-01-04") , holidays          , undefined       , "non workday>1!"                , false],
    [d("2023-01-04") , holidays          , undefined       , "non workday<2!"                , false],

    // -----------------------------------------------------------------------------------------------
    // 土日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "sun"                           , true],
    [d("2023-01-01") , holidays          , undefined       , "sun>1"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "sun<2"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "sun<!"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "sun>!"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "sun>1!"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "sun<2!"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "sun>1!"                        , true],
    [d("2023-01-02") , holidays          , undefined       , "sun<2!"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "sun<!"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "sun>!"                         , true],
    [d("2023-01-04") , holidays          , undefined       , "sun"                           , false],
    [d("2023-01-04") , holidays          , undefined       , "sun>1"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "sun<2"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "sun>1!"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "sun<2!"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "sun<!"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "sun>!"                         , false],
    [d("2023-01-06") , holidays          , undefined       , "sun<!"                         , true],
    [d("2023-01-06") , holidays          , undefined       , "sun>!"                         , false],
    [d("2023-01-07") , holidays          , undefined       , "sun<!"                         , false],
    [d("2023-01-07") , holidays          , undefined       , "sun>!"                         , false],
    [d("2023-01-08") , holidays          , undefined       , "sun"                           , true],
    [d("2023-01-08") , holidays          , undefined       , "sun>1"                         , false],
    [d("2023-01-08") , holidays          , undefined       , "sun<2"                         , false],
    [d("2023-01-08") , holidays          , undefined       , "sun<!"                         , false],
    [d("2023-01-08") , holidays          , undefined       , "sun>!"                         , false],

    // -----------------------------------------------------------------------------------------------
    // 平日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "mon"                           , false],
    [d("2023-01-01") , holidays          , undefined       , "mon>1"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "mon<2"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "mon<!"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "mon>!"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "mon"                           , true],
    [d("2023-01-02") , holidays          , undefined       , "mon>1"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "mon<2"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "mon<!"                         , true],
    [d("2023-01-02") , holidays          , undefined       , "mon>!"                         , true],
    [d("2023-01-04") , holidays          , undefined       , "mon"                           , false],
    [d("2023-01-04") , holidays          , undefined       , "mon>1"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "mon<2"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "mon<!"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "mon>!"                         , false],

    // -----------------------------------------------------------------------------------------------
    // 平日(休日絡み)
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "wed"                           , false],
    [d("2023-01-01") , holidays          , undefined       , "wed>1"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "wed<2"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "wed>!"                         , false],
    [d("2023-01-01") , holidays          , undefined       , "wed<!"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "wed"                           , false],
    [d("2023-01-02") , holidays          , undefined       , "wed>1"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "wed<2"                         , true],
    [d("2023-01-02") , holidays          , undefined       , "wed>!"                         , false],
    [d("2023-01-02") , holidays          , undefined       , "wed<!"                         , false],
    [d("2023-01-03") , holidays          , undefined       , "wed>!"                         , false],
    [d("2023-01-03") , holidays          , undefined       , "wed<!"                         , true],
    [d("2023-01-04") , holidays          , undefined       , "wed"                           , true],
    [d("2023-01-04") , holidays          , undefined       , "wed>1"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "wed<2"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "wed>!"                         , false],
    [d("2023-01-04") , holidays          , undefined       , "wed<!"                         , false],
    [d("2023-01-05") , holidays          , undefined       , "wed>!"                         , true],
    [d("2023-01-05") , holidays          , undefined       , "wed<!"                         , false],

    // -----------------------------------------------------------------------------------------------
    // 複数曜日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "mon/tue"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "mon/tue>1"                     , false],
    [d("2023-01-01") , holidays          , undefined       , "mon/tue<2"                     , true],
    [d("2023-01-02") , holidays          , undefined       , "mon/tue"                       , true],
    [d("2023-01-02") , holidays          , undefined       , "mon/tue>1"                     , false],
    [d("2023-01-02") , holidays          , undefined       , "mon/tue<2"                     , false],
    [d("2023-01-03") , holidays          , undefined       , "mon/tue"                       , true],
    [d("2023-01-03") , holidays          , undefined       , "mon/tue>1"                     , true],
    [d("2023-01-03") , holidays          , undefined       , "mon/tue<2"                     , false],
    [d("2023-01-04") , holidays          , undefined       , "mon/tue"                       , false],
    [d("2023-01-04") , holidays          , undefined       , "mon/tue>1"                     , true],
    [d("2023-01-04") , holidays          , undefined       , "mon/tue<2"                     , false],

    // -----------------------------------------------------------------------------------------------
    // 休日ではない土日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "sun!"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "sun!>1"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "sun!<2"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "sun!"                          , false],
    [d("2023-01-04") , holidays          , undefined       , "sun!>1"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "sun!<2"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "sun!"                          , true],
    [d("2023-01-08") , holidays          , undefined       , "sun!>1"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "sun!<2"                        , false],

    // -----------------------------------------------------------------------------------------------
    // 休日ではない平日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "mon!"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "mon!>1"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "mon!<2"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "mon!"                          , true],
    [d("2023-01-02") , holidays          , undefined       , "mon!>1"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "mon!<2"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "mon!"                          , false],
    [d("2023-01-04") , holidays          , undefined       , "mon!>1"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "mon!<2"                        , false],

    // -----------------------------------------------------------------------------------------------
    // 休日ではない平日(休日絡み)
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "wed!"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "wed!>1"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "wed!<2"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "wed!"                          , false],
    [d("2023-01-02") , holidays          , undefined       , "wed!>1"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "wed!<2"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "wed!"                          , false],
    [d("2023-01-04") , holidays          , undefined       , "wed!>1"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "wed!<2"                        , false],
    [d("2023-01-11") , holidays          , undefined       , "wed!"                          , true],
    [d("2023-01-11") , holidays          , undefined       , "wed!>1"                        , false],
    [d("2023-01-11") , holidays          , undefined       , "wed!<2"                        , false],

    // -----------------------------------------------------------------------------------------------
    // 休日ではない複数曜日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "tue!/wed!"                     , false],
    [d("2023-01-01") , holidays          , undefined       , "tue!/wed!>1"                   , false],
    [d("2023-01-01") , holidays          , undefined       , "tue!/wed!<2"                   , true],
    [d("2023-01-02") , holidays          , undefined       , "tue!/wed!"                     , false],
    [d("2023-01-02") , holidays          , undefined       , "tue!/wed!>1"                   , false],
    [d("2023-01-02") , holidays          , undefined       , "tue!/wed!<2"                   , false],
    [d("2023-01-03") , holidays          , undefined       , "tue!/wed!"                     , true],
    [d("2023-01-03") , holidays          , undefined       , "tue!/wed!>1"                   , false],
    [d("2023-01-03") , holidays          , undefined       , "tue!/wed!<2"                   , false],
    [d("2023-01-04") , holidays          , undefined       , "tue!/wed!"                     , false],
    [d("2023-01-04") , holidays          , undefined       , "tue!/wed!>1"                   , true],
    [d("2023-01-04") , holidays          , undefined       , "tue!/wed!<2"                   , false],

    // -----------------------------------------------------------------------------------------------
    // 休日の平日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-02") , holidays          , undefined       , "wed*<1!"                       , false],
    [d("2023-01-03") , holidays          , undefined       , "wed*<1!"                       , true],
    [d("2023-01-04") , holidays          , undefined       , "wed*<1!"                       , false],
    [d("2023-01-09") , holidays          , undefined       , "wed*<1!"                       , false],
    [d("2023-01-10") , holidays          , undefined       , "wed*<1!"                       , false],
    [d("2023-01-11") , holidays          , undefined       , "wed*<1!"                       , false],
    [d("2022-12-30") , holidays          , undefined       , "wed*<3!"                       , true],
    [d("2022-12-31") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2023-01-06") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2023-01-07") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2023-01-08") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2022-12-30") , holidays          , undefined       , "wed*<3"                        , false],
    [d("2022-12-31") , holidays          , undefined       , "wed*<3"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "wed*<3"                        , true],
    [d("2023-01-06") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2023-01-07") , holidays          , undefined       , "wed*<3!"                       , false],
    [d("2023-01-08") , holidays          , undefined       , "wed*<3!"                       , false],

    // -----------------------------------------------------------------------------------------------
    // 第1〇曜
    // -----------------------------------------------------------------------------------------------
    [d("2022-12-30") , holidays          , undefined       , "1mon<1!"                       , true],
    [d("2022-12-30") , holidays          , undefined       , "1mon<2!"                       , false],
    [d("2022-12-30") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2022-12-30") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2022-12-31") , holidays          , undefined       , "1mon<1!"                       , false],
    [d("2022-12-31") , holidays          , undefined       , "1mon<2!"                       , false],
    [d("2022-12-31") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2022-12-31") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "1mon"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "1mon<1"                        , true],
    [d("2023-01-01") , holidays          , undefined       , "1mon<1!"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "1mon<2!"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "1mon"                          , true],
    [d("2023-01-02") , holidays          , undefined       , "1mon>1!"                       , false],
    [d("2023-01-02") , holidays          , undefined       , "1mon>2!"                       , false],
    [d("2023-01-02") , holidays          , undefined       , "1mon>!"                        , true],
    [d("2023-01-02") , holidays          , undefined       , "1mon<!"                        , true],
    [d("2023-01-03") , holidays          , undefined       , "1mon>1"                        , true],
    [d("2023-01-03") , holidays          , undefined       , "1mon>1!"                       , true],
    [d("2023-01-03") , holidays          , undefined       , "1mon>2!"                       , false],
    [d("2023-01-03") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-03") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "1mon>2!"                       , false],
    [d("2023-01-04") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-04") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-05") , holidays          , undefined       , "1mon>2!"                       , true],
    [d("2023-01-05") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-05") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-06") , holidays          , undefined       , "1mon<1!"                       , false],
    [d("2023-01-06") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-06") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "1mon<1"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "1mon<1!"                       , false],
    [d("2023-01-08") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-09") , holidays          , undefined       , "1mon"                          , false],
    [d("2023-01-09") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-09") , holidays          , undefined       , "1mon<!"                        , false],
    [d("2023-01-10") , holidays          , undefined       , "1mon>1"                        , false],
    [d("2023-01-10") , holidays          , undefined       , "1mon>1!"                       , false],
    [d("2023-01-10") , holidays          , undefined       , "1mon>!"                        , false],
    [d("2023-01-10") , holidays          , undefined       , "1mon<!"                        , false],

    // -----------------------------------------------------------------------------------------------
    // 第2〇曜
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-02") , holidays          , undefined       , "2mon"                          , false],
    [d("2023-01-02") , holidays          , undefined       , "2mon>!"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "2mon<!"                        , false],
    [d("2023-01-06") , holidays          , undefined       , "2mon<1!"                       , true],
    [d("2023-01-06") , holidays          , undefined       , "2mon>!"                        , false],
    [d("2023-01-06") , holidays          , undefined       , "2mon<!"                        , false],
    [d("2023-01-07") , holidays          , undefined       , "2mon<1!"                       , false],
    [d("2023-01-07") , holidays          , undefined       , "2mon>!"                        , false],
    [d("2023-01-07") , holidays          , undefined       , "2mon<!"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "2mon<1"                        , true],
    [d("2023-01-08") , holidays          , undefined       , "2mon<1!"                       , false],
    [d("2023-01-08") , holidays          , undefined       , "2mon>!"                        , false],
    [d("2023-01-08") , holidays          , undefined       , "2mon<!"                        , false],
    [d("2023-01-09") , holidays          , undefined       , "2mon"                          , true],
    [d("2023-01-09") , holidays          , undefined       , "2mon>!"                        , true],
    [d("2023-01-09") , holidays          , undefined       , "2mon<!"                        , true],
    [d("2023-01-10") , holidays          , undefined       , "2mon>1"                        , true],
    [d("2023-01-10") , holidays          , undefined       , "2mon>1!"                       , true],
    [d("2023-01-10") , holidays          , undefined       , "2mon>!"                        , false],
    [d("2023-01-10") , holidays          , undefined       , "2mon<!"                        , false],

    // -----------------------------------------------------------------------------------------------
    // 第1〇曜 (休日絡み)
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-04") , holidays          , undefined       , "1wed"                          , true],
    [d("2023-01-11") , holidays          , undefined       , "1wed"                          , false],
    [d("2023-01-04") , holidays          , undefined       , "1wed!"                         , false],
    [d("2023-01-11") , holidays          , undefined       , "1wed!"                         , false],

    // -----------------------------------------------------------------------------------------------
    // 第1〇曜 複数
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "1sun/2sat"                     , true],
    [d("2023-01-07") , holidays          , undefined       , "1sun/2sat"                     , false],
    [d("2023-01-08") , holidays          , undefined       , "1sun/2sat"                     , false],
    [d("2023-01-14") , holidays          , undefined       , "1sun/2sat"                     , true],

    // -----------------------------------------------------------------------------------------------
    // 日指定
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , undefined       , "1d"                            , true],
    [d("2023-01-01") , holidays          , undefined       , "1d>1"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "1d<2"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "1d/2d"                         , true],
    [d("2023-01-01") , holidays          , undefined       , "1d/2d>1"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "1d/2d<1"                       , true],
    [d("2023-01-01") , holidays          , undefined       , "2d/1d"                         , true],
    [d("2023-01-01") , holidays          , undefined       , "2d/1d>1"                       , false],
    [d("2023-01-01") , holidays          , undefined       , "2d/1d<1"                       , true],
    [d("2023-01-01") , holidays          , undefined       , "11d"                           , false],
    [d("2023-01-01") , holidays          , undefined       , "11d/21d"                       , false],
    // 稼働日シフトの基本パターン
    [d("2023-01-01") , holidays          , undefined       , "1d"                            , true],
    [d("2023-01-01") , holidays          , undefined       , "1d>!"                          , false],
    [d("2023-01-02") , holidays          , undefined       , "1d>!"                          , true],
    [d("2023-01-03") , holidays          , undefined       , "1d>!"                          , false],
    [d("2022-12-29") , holidays          , undefined       , "1d<!"                          , false],
    [d("2022-12-30") , holidays          , undefined       , "1d<!"                          , true],
    [d("2022-12-31") , holidays          , undefined       , "1d<!"                          , false],
    [d("2022-01-01") , holidays          , undefined       , "1d<!"                          , false],

    // -----------------------------------------------------------------------------------------------
    // 月日指定
    // -----------------------------------------------------------------------------------------------
    [d("2022-01-01") , holidays          , undefined       , "0102"                          , false],
    [d("2022-01-02") , holidays          , undefined       , "0102"                          , true],
    [d("2022-02-01") , holidays          , undefined       , "0102"                          , false],
    [d("2022-02-02") , holidays          , undefined       , "0102"                          , false],
    [d("2023-01-01") , holidays          , undefined       , "0102"                          , false],
    [d("2023-01-02") , holidays          , undefined       , "0102"                          , true],
    [d("2023-02-01") , holidays          , undefined       , "0102"                          , false],
    [d("2023-02-02") , holidays          , undefined       , "0102"                          , false],
    // 稼働日シフトの基本パターン
    [d("2023-01-01") , holidays          , undefined       , "0101"                          , true],
    [d("2023-01-01") , holidays          , undefined       , "0101>!"                        , false],
    [d("2023-01-02") , holidays          , undefined       , "0101>!"                        , true],
    [d("2023-01-03") , holidays          , undefined       , "0101>!"                        , false],
    [d("2022-12-29") , holidays          , undefined       , "0101<!"                        , false],
    [d("2022-12-30") , holidays          , undefined       , "0101<!"                        , true],
    [d("2022-12-31") , holidays          , undefined       , "0101<!"                        , false],
    [d("2023-01-01") , holidays          , undefined       , "0101<!"                        , false],

    // -----------------------------------------------------------------------------------------------
    // 〇日おき
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-01") , holidays          , d("2023-01-01") , "every 2 day"                   , true],
    [d("2023-01-01") , holidays          , d("2023-01-01") , "every 2 day>1"                 , false],
    [d("2023-01-01") , holidays          , d("2023-01-01") , "every 2 day<2"                 , true],
    [d("2023-01-02") , holidays          , d("2023-01-01") , "every 2 day"                   , false],
    [d("2023-01-02") , holidays          , d("2023-01-01") , "every 2 day>1"                 , true],
    [d("2023-01-02") , holidays          , d("2023-01-01") , "every 2 day<2"                 , false],
    [d("2023-01-03") , holidays          , d("2023-01-01") , "every 2 day"                   , true],
    [d("2023-01-03") , holidays          , d("2023-01-01") , "every 2 day>1"                 , false],
    [d("2023-01-03") , holidays          , d("2023-01-01") , "every 2 day<2"                 , true],
    [d("2023-01-04") , holidays          , d("2023-01-01") , "every 2 day"                   , false],
    [d("2023-01-04") , holidays          , d("2023-01-01") , "every 2 day>1"                 , true],
    [d("2023-01-04") , holidays          , d("2023-01-01") , "every 2 day<2"                 , false],
    [d("2023-01-01") , holidays          , d("2023-01-01") , "every 3 day"                   , true],
    [d("2023-01-01") , holidays          , d("2023-01-01") , "every 3 day>1"                 , false],
    [d("2023-01-01") , holidays          , d("2023-01-01") , "every 3 day<2"                 , false],
    [d("2023-01-02") , holidays          , d("2023-01-01") , "every 3 day"                   , false],
    [d("2023-01-02") , holidays          , d("2023-01-01") , "every 3 day>1"                 , true],
    [d("2023-01-02") , holidays          , d("2023-01-01") , "every 3 day<2"                 , true],
    [d("2023-01-03") , holidays          , d("2023-01-01") , "every 3 day"                   , false],
    [d("2023-01-03") , holidays          , d("2023-01-01") , "every 3 day>1"                 , false],
    [d("2023-01-03") , holidays          , d("2023-01-01") , "every 3 day<2"                 , false],
    [d("2023-01-04") , holidays          , d("2023-01-01") , "every 3 day"                   , true],
    [d("2023-01-04") , holidays          , d("2023-01-01") , "every 3 day>1"                 , false],
    [d("2023-01-04") , holidays          , d("2023-01-01") , "every 3 day<2"                 , false],
    [d("2023-01-05") , holidays          , d("2023-01-01") , "every 3 day"                   , false],
    [d("2023-01-05") , holidays          , d("2023-01-01") , "every 3 day>1"                 , true],
    [d("2023-01-05") , holidays          , d("2023-01-01") , "every 3 day<2"                 , true],
    [d("2023-01-06") , holidays          , d("2023-01-01") , "every 3 day"                   , false],
    [d("2023-01-06") , holidays          , d("2023-01-01") , "every 3 day>1"                 , false],
    [d("2023-01-06") , holidays          , d("2023-01-01") , "every 3 day<2"                 , false],
    [d("2023-01-07") , holidays          , d("2023-01-01") , "every 3 day"                   , true],
    [d("2023-01-07") , holidays          , d("2023-01-01") , "every 3 day>1"                 , false],
    [d("2023-01-07") , holidays          , d("2023-01-01") , "every 3 day<2"                 , false],
    [d("2023-01-01") , holidays          , d("2023-01-15") , "every 2 day"                   , false],
    [d("2023-01-01") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-01") , holidays          , d("2023-01-15") , "every 2 day<2"                 , false],
    [d("2023-01-02") , holidays          , d("2023-01-15") , "every 2 day"                   , false],
    [d("2023-01-02") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-02") , holidays          , d("2023-01-15") , "every 2 day<2"                 , false],
    [d("2023-01-03") , holidays          , d("2023-01-15") , "every 2 day"                   , false],
    [d("2023-01-03") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-03") , holidays          , d("2023-01-15") , "every 2 day<2"                 , false],
    [d("2023-01-13") , holidays          , d("2023-01-15") , "every 2 day"                   , false],
    [d("2023-01-13") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-13") , holidays          , d("2023-01-15") , "every 2 day<2"                 , true],
    [d("2023-01-14") , holidays          , d("2023-01-15") , "every 2 day"                   , false],
    [d("2023-01-14") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-14") , holidays          , d("2023-01-15") , "every 2 day<2"                 , false],
    [d("2023-01-15") , holidays          , d("2023-01-15") , "every 2 day"                   , true],
    [d("2023-01-15") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-15") , holidays          , d("2023-01-15") , "every 2 day<2"                 , true],
    [d("2023-01-16") , holidays          , d("2023-01-15") , "every 2 day"                   , false],
    [d("2023-01-16") , holidays          , d("2023-01-15") , "every 2 day>1"                 , true],
    [d("2023-01-16") , holidays          , d("2023-01-15") , "every 2 day<2"                 , false],
    [d("2023-01-17") , holidays          , d("2023-01-15") , "every 2 day"                   , true],
    [d("2023-01-17") , holidays          , d("2023-01-15") , "every 2 day>1"                 , false],
    [d("2023-01-17") , holidays          , d("2023-01-15") , "every 2 day<2"                 , true],

    // -----------------------------------------------------------------------------------------------
    // 月末
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-27") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-01-27") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-01-27") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-01-27") , holidays          , undefined       , "end of month>1!"               , false],
    [d("2023-01-27") , holidays          , undefined       , "end of month<2!"               , true],
    [d("2023-01-28") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-01-28") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-01-28") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-01-28") , holidays          , undefined       , "end of month>1!"               , false],
    [d("2023-01-28") , holidays          , undefined       , "end of month<2!"               , false],
    [d("2023-01-29") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-01-29") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-01-29") , holidays          , undefined       , "end of month<2"                , true],
    [d("2023-01-29") , holidays          , undefined       , "end of month>1!"               , false],
    [d("2023-01-29") , holidays          , undefined       , "end of month<2!"               , false],
    [d("2023-01-30") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-01-30") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-01-30") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-01-30") , holidays          , undefined       , "end of month>1!"               , false],
    [d("2023-01-30") , holidays          , undefined       , "end of month<2!"               , false],
    [d("2023-01-31") , holidays          , undefined       , "end of month"                  , true],
    [d("2023-01-31") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-01-31") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-01-31") , holidays          , undefined       , "end of month>1!"               , false],
    [d("2023-01-31") , holidays          , undefined       , "end of month<2!"               , false],
    [d("2023-02-01") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-02-01") , holidays          , undefined       , "end of month>1"                , true],
    [d("2023-02-01") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-02-01") , holidays          , undefined       , "end of month>1!"               , true],
    [d("2023-02-01") , holidays          , undefined       , "end of month<2!"               , false],
    [d("2023-04-28") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-04-28") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-04-28") , holidays          , undefined       , "end of month<2"                , true],
    [d("2023-04-29") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-04-29") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-04-29") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-04-30") , holidays          , undefined       , "end of month"                  , true],
    [d("2023-04-30") , holidays          , undefined       , "end of month>1"                , false],
    [d("2023-04-30") , holidays          , undefined       , "end of month<2"                , false],
    [d("2023-05-01") , holidays          , undefined       , "end of month"                  , false],
    [d("2023-05-01") , holidays          , undefined       , "end of month>1"                , true],
    [d("2023-05-01") , holidays          , undefined       , "end of month<2"                , false],

    // -----------------------------------------------------------------------------------------------
    // 月末稼働日
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-30") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-01-30") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-01-30") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-01-31") , holidays          , undefined       , "workday end of month"          , true],
    [d("2023-01-31") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-01-31") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-02-01") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-02-01") , holidays          , undefined       , "workday end of month>1"        , true],
    [d("2023-02-01") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-04-26") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-04-26") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-04-26") , holidays          , undefined       , "workday end of month<2"        , true],
    [d("2023-04-26") , holidays          , undefined       , "workday end of month>1!"       , false],
    [d("2023-04-26") , holidays          , undefined       , "workday end of month<2!"       , true],
    [d("2023-04-27") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-04-27") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-04-27") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-04-27") , holidays          , undefined       , "workday end of month>1!"       , false],
    [d("2023-04-27") , holidays          , undefined       , "workday end of month<2!"       , false],
    [d("2023-04-28") , holidays          , undefined       , "workday end of month"          , true],
    [d("2023-04-28") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-04-28") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-04-28") , holidays          , undefined       , "workday end of month>1!"       , false],
    [d("2023-04-28") , holidays          , undefined       , "workday end of month<2!"       , false],
    [d("2023-04-29") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-04-29") , holidays          , undefined       , "workday end of month>1"        , true],
    [d("2023-04-29") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-04-29") , holidays          , undefined       , "workday end of month>1!"       , false],
    [d("2023-04-29") , holidays          , undefined       , "workday end of month<2!"       , false],
    [d("2023-04-30") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-04-30") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-04-30") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-04-30") , holidays          , undefined       , "workday end of month>1!"       , false],
    [d("2023-04-30") , holidays          , undefined       , "workday end of month<2!"       , false],
    [d("2023-05-01") , holidays          , undefined       , "workday end of month"          , false],
    [d("2023-05-01") , holidays          , undefined       , "workday end of month>1"        , false],
    [d("2023-05-01") , holidays          , undefined       , "workday end of month<2"        , false],
    [d("2023-05-01") , holidays          , undefined       , "workday end of month>1!"       , true],
    [d("2023-05-01") , holidays          , undefined       , "workday end of month<2!"       , false],
    [d("2023-04-28") , ["2023-04-28"]    , undefined       , "workday end of month"          , false],
    [d("2023-04-27") , ["2023-04-28"]    , undefined       , "workday end of month"          , true],

    // -----------------------------------------------------------------------------------------------
    // 月初
    // -----------------------------------------------------------------------------------------------
    [d("2023-06-29") , holidays          , undefined       , "beginning of month"            , false],
    [d("2023-06-29") , holidays          , undefined       , "beginning of month>1"          , false],
    [d("2023-06-29") , holidays          , undefined       , "beginning of month<2"          , true],
    [d("2023-06-29") , holidays          , undefined       , "beginning of month>1!"         , false],
    [d("2023-06-29") , holidays          , undefined       , "beginning of month<2!"         , true],
    [d("2023-06-30") , holidays          , undefined       , "beginning of month"            , false],
    [d("2023-06-30") , holidays          , undefined       , "beginning of month>1"          , false],
    [d("2023-06-30") , holidays          , undefined       , "beginning of month<2"          , false],
    [d("2023-06-30") , holidays          , undefined       , "beginning of month>1!"         , false],
    [d("2023-06-30") , holidays          , undefined       , "beginning of month<2!"         , false],
    [d("2023-07-01") , holidays          , undefined       , "beginning of month"            , true],
    [d("2023-07-01") , holidays          , undefined       , "beginning of month>1"          , false],
    [d("2023-07-01") , holidays          , undefined       , "beginning of month<2"          , false],
    [d("2023-07-01") , holidays          , undefined       , "beginning of month>1!"         , false],
    [d("2023-07-01") , holidays          , undefined       , "beginning of month<2!"         , false],
    [d("2023-07-02") , holidays          , undefined       , "beginning of month"            , false],
    [d("2023-07-02") , holidays          , undefined       , "beginning of month>1"          , true],
    [d("2023-07-02") , holidays          , undefined       , "beginning of month<2"          , false],
    [d("2023-07-02") , holidays          , undefined       , "beginning of month>1!"         , false],
    [d("2023-07-02") , holidays          , undefined       , "beginning of month<2!"         , false],
    [d("2023-07-03") , holidays          , undefined       , "beginning of month"            , false],
    [d("2023-07-03") , holidays          , undefined       , "beginning of month>1"          , false],
    [d("2023-07-03") , holidays          , undefined       , "beginning of month<2"          , false],
    [d("2023-07-03") , holidays          , undefined       , "beginning of month>1!"         , true],
    [d("2023-07-03") , holidays          , undefined       , "beginning of month<2!"         , false],

    // -----------------------------------------------------------------------------------------------
    // 月初稼働日
    // -----------------------------------------------------------------------------------------------
    [d("2023-06-29") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-06-29") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-06-29") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-06-29") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-06-29") , holidays          , undefined       , "workday beginning of month<2!" , true],
    [d("2023-06-30") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-06-30") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-06-30") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-06-30") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-06-30") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-07-01") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-07-01") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-07-01") , holidays          , undefined       , "workday beginning of month<2"  , true],
    [d("2023-07-01") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-07-01") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-07-02") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-07-02") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-07-02") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-07-02") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-07-02") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-07-03") , holidays          , undefined       , "workday beginning of month"    , true],
    [d("2023-07-03") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-07-03") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-07-03") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-07-03") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-07-04") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-07-04") , holidays          , undefined       , "workday beginning of month>1"  , true],
    [d("2023-07-04") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-07-04") , holidays          , undefined       , "workday beginning of month>1!" , true],
    [d("2023-07-04") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-02-27") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-02-27") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-02-27") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-02-27") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-02-27") , holidays          , undefined       , "workday beginning of month<2!" , true],
    [d("2023-02-28") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-02-28") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-02-28") , holidays          , undefined       , "workday beginning of month<2"  , true],
    [d("2023-02-28") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-02-28") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-03-01") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-03-01") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-03-01") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-03-01") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-03-01") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-03-02") , holidays          , undefined       , "workday beginning of month"    , true],
    [d("2023-03-02") , holidays          , undefined       , "workday beginning of month>1"  , false],
    [d("2023-03-02") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-03-02") , holidays          , undefined       , "workday beginning of month>1!" , false],
    [d("2023-03-02") , holidays          , undefined       , "workday beginning of month<2!" , false],
    [d("2023-03-03") , holidays          , undefined       , "workday beginning of month"    , false],
    [d("2023-03-03") , holidays          , undefined       , "workday beginning of month>1"  , true],
    [d("2023-03-03") , holidays          , undefined       , "workday beginning of month<2"  , false],
    [d("2023-03-03") , holidays          , undefined       , "workday beginning of month>1!" , true],
    [d("2023-03-03") , holidays          , undefined       , "workday beginning of month<2!" , false],

    // -----------------------------------------------------------------------------------------------
    // 複数条件
    // -----------------------------------------------------------------------------------------------
    [d("2023-01-03") , holidays          , undefined       , "wed!|wed*>1!"                  , false],
    [d("2023-01-04") , holidays          , undefined       , "wed!|wed*>1!"                  , false],
    [d("2023-01-05") , holidays          , undefined       , "wed!|wed*>1!"                  , true],
    [d("2023-01-06") , holidays          , undefined       , "wed!|wed*>1!"                  , false],
    [d("2023-01-11") , holidays          , undefined       , "wed!|wed*>1!"                  , true],
    [d("2023-01-12") , holidays          , undefined       , "wed!|wed*>1!"                  , false],
    [d("2023-01-03") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , false],
    [d("2023-01-04") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , true],
    [d("2023-01-05") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , false],
    [d("2023-01-06") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , false],
    [d("2023-01-07") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , true],
    [d("2023-01-08") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , true],
    [d("2023-01-09") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , false],
    [d("2023-01-10") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , true],
    [d("2023-01-11") , holidays          , undefined       , "non workday|wed|10d/20d/30d"   , true],
  ],
  ([date, holidays, baseDate, repetitionWord, expected]) => {
    DateTime.setHolidays(...holidays);
    const task = RepetitionTask.of({
      repetitions: Repetition.fromRepetitionsStr(repetitionWord)._ok!,
      baseDate,
      name: "hoge",
    });

    assertEquals(task.shouldTry(date), expected);
  },
  (name, [date, _holidays, baseDate, repetitionWord, expected]) =>
    `[${name}] ${date.displayDate}: "${repetitionWord}" is "${expected}" -- ${
      baseDate ? "base: " + baseDate.displayDate : ""
    }`,
);

parameterizedTest<
  [
    Parameters<typeof reverseOffsetWorkdays>[0],
    Parameters<typeof reverseOffsetWorkdays>[1],
    ReturnType<typeof reverseOffsetWorkdays>,
  ]
>(
  "reverseOffsetWorkdays",
  // deno-fmt-ignore
  // prettier-ignore
  //   dst              | days    | expected
  [
    [  d("2023-01-03")  , 1       , [d("2023-01-02")] ],
    [  d("2023-01-03")  , 2       , [d("2023-01-01"), d("2022-12-31"), d("2022-12-30")] ],
    [  d("2023-01-03")  , 3       , [d("2022-12-29")] ],
    [  d("2023-01-03")  , -1      , [d("2023-01-04"), d("2023-01-05")] ],
    [  d("2023-01-03")  , -2      , [d("2023-01-06")] ],
    [  d("2023-01-03")  , -3      , [d("2023-01-07"), d("2023-01-08"), d("2023-01-09")] ],
    [  d("2023-01-04")  , 1       , [] ],
  ] as const,
  ([dst, days, expected]) => {
    DateTime.setHolidays(...holidays);
    assertEquals(reverseOffsetWorkdays(dst, days), expected);
  },
);
