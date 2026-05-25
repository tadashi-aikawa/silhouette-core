import { aggregate, err, ok, type Result, ValueObject } from "owlelia";
import { ParseError } from "../../util/errors.ts";
import { match } from "../../util/strings.ts";
import { uniq } from "../../util/collections.ts";

type LengthOfString<
  S extends string,
  Cnt extends unknown[] = [],
> = S extends `${infer _}${infer R}` ? LengthOfString<R, [1, ...Cnt]>
  : Cnt["length"];

type ZeroPadding2<T extends string> = T extends unknown
  ? LengthOfString<T> extends 1 ? `0${T}`
  : T
  : never;

type Months =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12";

type Days =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31";

type MMDD = `${ZeroPadding2<Months>}${ZeroPadding2<Days>}`;

type WeekNo = 1 | 2 | 3 | 4 | 5;
type DayOfWeekShortName = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type Pattern =
  | { type: "period"; period: number }
  | { type: "specific"; values: number[] };
export type Token =
  | "every day"
  | "weekday"
  | "weekend"
  | "workday"
  | "non workday"
  | DayOfWeekShortName
  | `${DayOfWeekShortName}!`
  | `${WeekNo}${DayOfWeekShortName}`
  | `${WeekNo}${DayOfWeekShortName}!`
  | `${Days}d`
  | `${MMDD}`
  | `every ${Days} days`
  | "end of month"
  | "workday end of month";
export type ShiftDirection = "next" | "prev";

interface Props {
  day: Pattern;
  dayOfWeek: DayOfWeek[];
  dayOfWeekHoliday: DayOfWeek[];
  week: Pattern;
  month: Pattern;
  dayOffset: number;
  workdayOffset: number;
  special?: "end of month" | "beginning of month";
  workdayShift?: ShiftDirection;
}

// 0: Sun, 1: Mon, ... 6: Sat
// 10: First sun, 11: First Mon, ...
// 20: Second sun, 21: Second Mon, ...
type DayOfWeek =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56;
const DAY_OF_WEEK_MAPPINGS: { [key: string]: DayOfWeek } = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  "1sun": 10,
  "1mon": 11,
  "1tue": 12,
  "1wed": 13,
  "1thu": 14,
  "1fri": 15,
  "1sat": 16,
  "2sun": 20,
  "2mon": 21,
  "2tue": 22,
  "2wed": 23,
  "2thu": 24,
  "2fri": 25,
  "2sat": 26,
  "3sun": 30,
  "3mon": 31,
  "3tue": 32,
  "3wed": 33,
  "3thu": 34,
  "3fri": 35,
  "3sat": 36,
  "4sun": 40,
  "4mon": 41,
  "4tue": 42,
  "4wed": 43,
  "4thu": 44,
  "4fri": 45,
  "4sat": 46,
  "5sun": 50,
  "5mon": 51,
  "5tue": 52,
  "5wed": 53,
  "5thu": 54,
  "5fri": 55,
  "5sat": 56,
};

const DAY_OF_WEEK_WORKDAY_MAPPINGS: { [key: string]: DayOfWeek } = {
  "sun!": 0,
  "mon!": 1,
  "tue!": 2,
  "wed!": 3,
  "thu!": 4,
  "fri!": 5,
  "sat!": 6,
  "1sun!": 10,
  "1mon!": 11,
  "1tue!": 12,
  "1wed!": 13,
  "1thu!": 14,
  "1fri!": 15,
  "1sat!": 16,
  "2sun!": 20,
  "2mon!": 21,
  "2tue!": 22,
  "2wed!": 23,
  "2thu!": 24,
  "2fri!": 25,
  "2sat!": 26,
  "3sun!": 30,
  "3mon!": 31,
  "3tue!": 32,
  "3wed!": 33,
  "3thu!": 34,
  "3fri!": 35,
  "3sat!": 36,
  "4sun!": 40,
  "4mon!": 41,
  "4tue!": 42,
  "4wed!": 43,
  "4thu!": 44,
  "4fri!": 45,
  "4sat!": 46,
  "5sun!": 50,
  "5mon!": 51,
  "5tue!": 52,
  "5wed!": 53,
  "5thu!": 54,
  "5fri!": 55,
  "5sat!": 56,
};

const DAY_OF_WEEK_HOLIDAY_MAPPINGS: { [key: string]: DayOfWeek } = {
  "sun*": 0,
  "mon*": 1,
  "tue*": 2,
  "wed*": 3,
  "thu*": 4,
  "fri*": 5,
  "sat*": 6,
  "1sun*": 10,
  "1mon*": 11,
  "1tue*": 12,
  "1wed*": 13,
  "1thu*": 14,
  "1fri*": 15,
  "1sat*": 16,
  "2sun*": 20,
  "2mon*": 21,
  "2tue*": 22,
  "2wed*": 23,
  "2thu*": 24,
  "2fri*": 25,
  "2sat*": 26,
  "3sun*": 30,
  "3mon*": 31,
  "3tue*": 32,
  "3wed*": 33,
  "3thu*": 34,
  "3fri*": 35,
  "3sat*": 36,
  "4sun*": 40,
  "4mon*": 41,
  "4tue*": 42,
  "4wed*": 43,
  "4thu*": 44,
  "4fri*": 45,
  "4sat*": 46,
  "5sun*": 50,
  "5mon*": 51,
  "5tue*": 52,
  "5wed*": 53,
  "5thu*": 54,
  "5fri*": 55,
  "5sat*": 56,
};

const repetitionBase = {
  day: { type: "period", period: 1 },
  dayOfWeek: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[],
  dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[],
  week: { type: "period", period: 1 },
  month: { type: "period", period: 1 },
  dayOffset: 0,
  workdayOffset: 0,
} as const;

export function divideTokenWithOffset(
  token: string,
): [
  token: string,
  dayOffset: number,
  workdayOffset: number,
  workdayShift: ShiftDirection | undefined,
] {
  const [tp, pastOffset] = token.split("<");
  if (pastOffset === "!") {
    return [tp, 0, 0, "prev"];
  }
  if (pastOffset) {
    return pastOffset.endsWith("!")
      ? [tp, 0, -1 * Number(pastOffset.slice(0, -1)), undefined]
      : [tp, -1 * Number(pastOffset), 0, undefined];
  }

  const [tf, futureOffset] = token.split(">");
  if (futureOffset === "!") {
    return [tf, 0, 0, "next"];
  }
  if (futureOffset) {
    return futureOffset.endsWith("!")
      ? [tf, 0, Number(futureOffset.slice(0, -1)), undefined]
      : [tf, Number(futureOffset), 0, undefined];
  }

  return [token, 0, 0, undefined];
}

const DAY_OF_WEEK_JA_MAPPINGS: Record<DayOfWeekShortName, string> = {
  sun: "日曜",
  mon: "月曜",
  tue: "火曜",
  wed: "水曜",
  thu: "木曜",
  fri: "金曜",
  sat: "土曜",
};

const DAY_OF_WEEK_SHORT_NAMES = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

function equalsArray<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function toDaysJapanese(days: number[]): string {
  return days.map((x) => `${x}日`).join("または");
}

/**
 * 繰り返し情報を扱うクラス
 */
export class Repetition extends ValueObject<Props> {
  static get everyDay(): Repetition {
    return new Repetition(repetitionBase);
  }

  static get weekday(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [1, 2, 3, 4, 5],
    });
  }

  static get weekend(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [0, 6],
      dayOfWeekHoliday: [0, 6],
    });
  }

  static get workday(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
    });
  }

  static get nonWorkday(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [0, 6],
      dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
    });
  }

  static everyNDay(nDay: number): Repetition {
    return new Repetition({
      ...repetitionBase,
      day: { type: "period", period: nDay },
    });
  }

  static get endOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      special: "end of month",
    });
  }

  static get workdayEndOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
      special: "end of month",
    });
  }

  static get beginningOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      special: "beginning of month",
    });
  }

  static get workdayBeginningOfMonth(): Repetition {
    return new Repetition({
      ...repetitionBase,
      dayOfWeek: [1, 2, 3, 4, 5],
      dayOfWeekHoliday: [],
      special: "beginning of month",
    });
  }

  get day(): Pattern {
    return this._value.day;
  }
  get dayOfWeek(): number[] {
    return this._value.dayOfWeek;
  }
  get dayOfWeekHoliday(): number[] {
    return this._value.dayOfWeekHoliday;
  }
  get week(): Pattern {
    return this._value.week;
  }
  get month(): Pattern {
    return this._value.month;
  }
  get dayOffset(): number {
    return this._value.dayOffset;
  }
  get workdayOffset(): number {
    return this._value.workdayOffset;
  }
  get workdayShift(): ShiftDirection | undefined {
    return this._value.workdayShift;
  }
  get special(): Props["special"] {
    return this._value.special;
  }

  withOffset(args: { dayOffset: number; workdayOffset: number }): Repetition {
    const { dayOffset, workdayOffset } = args;
    return new Repetition({ ...this._value, dayOffset, workdayOffset });
  }

  withWorkdayShift(workdayShift: ShiftDirection | undefined): Repetition {
    return new Repetition({ ...this._value, workdayShift });
  }

  toJapanese(): string {
    return this.toJapaneseBase() + this.toJapaneseOffset();
  }

  private toJapaneseBase(): string {
    if (this.special === "beginning of month") {
      return this.isWorkdayPattern() ? "月初の稼働日" : "月初";
    }
    if (this.special === "end of month") {
      return this.isWorkdayPattern() ? "月末の稼働日" : "月末";
    }

    if (this.day.type === "specific") {
      if (this.month.type === "specific") {
        return `毎年${this.month.values[0]}月${this.day.values[0]}日`;
      }

      return `毎月${toDaysJapanese(this.day.values)}`;
    }

    if (this.day.period !== 1) {
      return `${this.day.period}日ごと`;
    }

    if (this.isEveryDayPattern()) {
      return "毎日";
    }
    if (this.isWeekdayPattern()) {
      return "平日(月～金)";
    }
    if (this.isWeekendPattern()) {
      return "土日";
    }
    if (this.isWorkdayPattern()) {
      return "稼働日";
    }
    if (this.isNonWorkdayPattern()) {
      return "稼働日ではない日";
    }

    return this.toDayOfWeekJapanese();
  }

  private toDayOfWeekJapanese(): string {
    return uniq([...this.dayOfWeek, ...this.dayOfWeekHoliday])
      .map((dayOfWeek) => {
        const inDayOfWeek = this.dayOfWeek.includes(dayOfWeek);
        const inDayOfWeekHoliday = this.dayOfWeekHoliday.includes(dayOfWeek);

        return this.toSingleDayOfWeekJapanese({
          dayOfWeek: dayOfWeek as DayOfWeek,
          target: inDayOfWeek && inDayOfWeekHoliday
            ? "all"
            : inDayOfWeek
            ? "workday"
            : "holiday",
        });
      })
      .join("・");
  }

  private toSingleDayOfWeekJapanese(args: {
    dayOfWeek: DayOfWeek;
    target: "all" | "workday" | "holiday";
  }): string {
    const dayOfWeek = args.dayOfWeek % 10;
    const weekNo = args.dayOfWeek >= 10
      ? `第${Math.floor(args.dayOfWeek / 10)}`
      : "";
    const name = DAY_OF_WEEK_JA_MAPPINGS[DAY_OF_WEEK_SHORT_NAMES[dayOfWeek]];

    switch (args.target) {
      case "workday":
        return `休日ではない${weekNo}${name}`;
      case "holiday":
        return `休日の${weekNo}${name}`;
      case "all":
        return `${weekNo}${name}`;
    }
  }

  private toJapaneseOffset(): string {
    if (this.workdayShift === "next") {
      return "（稼働日でない場合は翌稼働日）";
    }
    if (this.workdayShift === "prev") {
      return "（稼働日でない場合は前稼働日）";
    }
    if (this.workdayOffset > 0) {
      return `の${this.workdayOffset}稼働日後`;
    }
    if (this.workdayOffset < 0) {
      return `の${-this.workdayOffset}稼働日前`;
    }
    if (this.dayOffset > 0) {
      return `の${this.dayOffset}日後`;
    }
    if (this.dayOffset < 0) {
      return `の${-this.dayOffset}日前`;
    }

    return "";
  }

  private isEveryDayPattern(): boolean {
    return equalsArray(this.dayOfWeek, [0, 1, 2, 3, 4, 5, 6]) &&
      equalsArray(this.dayOfWeekHoliday, [0, 1, 2, 3, 4, 5, 6]);
  }

  private isWeekdayPattern(): boolean {
    return equalsArray(this.dayOfWeek, [1, 2, 3, 4, 5]) &&
      equalsArray(this.dayOfWeekHoliday, [1, 2, 3, 4, 5]);
  }

  private isWeekendPattern(): boolean {
    return equalsArray(this.dayOfWeek, [0, 6]) &&
      equalsArray(this.dayOfWeekHoliday, [0, 6]);
  }

  private isWorkdayPattern(): boolean {
    return equalsArray(this.dayOfWeek, [1, 2, 3, 4, 5]) &&
      equalsArray(this.dayOfWeekHoliday, []);
  }

  private isNonWorkdayPattern(): boolean {
    return equalsArray(this.dayOfWeek, [0, 6]) &&
      equalsArray(this.dayOfWeekHoliday, [0, 1, 2, 3, 4, 5, 6]);
  }

  /**
   * 文字列パターンから複数の繰り返し情報を生成します
   *
   * ```ts
   * Repetition.fromRepetitionsStr("non workday|tue/wed");
   * Repetition.fromRepetitionsStr("non workday|tue/wed|15d");
   * ```
   */
  static fromRepetitionsStr(
    repetitionsStr: string,
  ): Result<Repetition[], ParseError[]> {
    return aggregate(repetitionsStr.split("|").map((x) => Repetition.from(x)));
  }

  /**
   * 文字列パターンから1つの繰り返し情報を生成します
   *
   * ```ts
   * Repetition.from("weekday");
   * Repetition.from("sun!/mon!");
   * Repetition.from("workday end of month");
   * ```
   */
  static from(str: string): Result<Repetition, ParseError> {
    const [token, dayOffset, workdayOffset, workdayShift] =
      divideTokenWithOffset(str);

    switch (token as Token | string) {
      case "every day":
      case "everyday":
        return ok(
          Repetition.everyDay
            .withOffset({ dayOffset, workdayOffset })
            .withWorkdayShift(workdayShift),
        );
      case "weekday":
      case "week day":
        return ok(
          Repetition.weekday
            .withOffset({ dayOffset, workdayOffset })
            .withWorkdayShift(workdayShift),
        );
      case "weekend":
      case "week end":
        return ok(
          Repetition.weekend
            .withOffset({ dayOffset, workdayOffset })
            .withWorkdayShift(workdayShift),
        );
      case "workday":
      case "work day":
        return ok(
          Repetition.workday
            .withOffset({ dayOffset, workdayOffset })
            .withWorkdayShift(workdayShift),
        );
      case "non workday":
      case "non work day":
        return ok(
          Repetition.nonWorkday
            .withOffset({ dayOffset, workdayOffset })
            .withWorkdayShift(workdayShift),
        );
      case "end of month":
        return ok(
          Repetition.endOfMonth
            .withOffset({ dayOffset, workdayOffset })
            .withWorkdayShift(workdayShift),
        );
      case "workday end of month":
        return ok(
          Repetition.workdayEndOfMonth
            .withOffset({
              dayOffset,
              workdayOffset,
            })
            .withWorkdayShift(workdayShift),
        );
      case "beginning of month":
        return ok(
          Repetition.beginningOfMonth
            .withOffset({
              dayOffset,
              workdayOffset,
            })
            .withWorkdayShift(workdayShift),
        );
      case "workday beginning of month":
        return ok(
          Repetition.workdayBeginningOfMonth
            .withOffset({
              dayOffset,
              workdayOffset,
            })
            .withWorkdayShift(workdayShift),
        );
      default: {
        const dayPeriod = token.match(/every (?<period>\d+) day/)?.groups
          ?.period;
        if (dayPeriod) {
          return ok(
            Repetition.everyNDay(Number(dayPeriod))
              .withOffset({
                dayOffset,
                workdayOffset,
              })
              .withWorkdayShift(workdayShift),
          );
        }
      }
    }

    // 毎年特定日繰り返し
    const mm = token.slice(0, 2);
    const dd = token.slice(2);
    if (match(mm, /(0[1-9]|1[0-2])/) && match(dd, /(0[1-9]|[12][0-9]|3[01])/)) {
      return ok(
        new Repetition({
          day: { type: "specific", values: [Number(dd)] }, // FIXME:tokenを解析して日を入れる
          dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
          dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
          week: { type: "period", period: 1 },
          month: { type: "specific", values: [Number(mm)] }, // FIXME:tokenを解析して月を入れる
          dayOffset,
          workdayOffset,
          workdayShift,
        }),
      );
    }

    // --------------------------------------------------
    // / の複数指定解析系
    // --------------------------------------------------
    const tokens: Token[] = token.split("/") as Token[];

    // 曜日系
    const dayOfWeek = tokens
      .map((x) => DAY_OF_WEEK_MAPPINGS[x] ?? DAY_OF_WEEK_WORKDAY_MAPPINGS[x])
      .filter((x) => x !== undefined);
    const dayOfWeekHoliday = tokens
      .map((x) => DAY_OF_WEEK_MAPPINGS[x] ?? DAY_OF_WEEK_HOLIDAY_MAPPINGS[x])
      .filter((x) => x !== undefined);
    if (dayOfWeek.length > 0 || dayOfWeekHoliday.length > 0) {
      if (tokens.length !== uniq([...dayOfWeek, ...dayOfWeekHoliday]).length) {
        return err(
          new ParseError(
            `曜日とそれ以外のパターンを/で複数指定することはできません (値: ${token})`,
          ),
        );
      }
      return ok(
        new Repetition({
          day: { type: "period", period: 1 },
          dayOfWeek,
          dayOfWeekHoliday,
          week: { type: "period", period: 1 },
          month: { type: "period", period: 1 },
          dayOffset,
          workdayOffset,
          workdayShift,
        }),
      );
    }

    // 月の特定日
    const days = tokens
      .filter((x) => match(x, /(0?[1-9]|[12][0-9]|3[01])d/))
      .map((x) => Number(x.slice(0, -1)));
    const to = (x: number[]): Pattern =>
      x.length > 0
        ? { type: "specific", values: x }
        : { type: "period", period: 1 };
    if (days.length > 0) {
      if (days.length !== tokens.length) {
        return err(
          new ParseError(
            `毎月特定日とそれ以外のパターンを/で複数指定することはできません (値: ${token})`,
          ),
        );
      }
      return ok(
        new Repetition({
          day: to(days),
          dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
          dayOfWeekHoliday: [0, 1, 2, 3, 4, 5, 6],
          week: { type: "period", period: 1 },
          month: { type: "period", period: 1 },
          dayOffset,
          workdayOffset,
          workdayShift,
        }),
      );
    }

    return err(
      new ParseError(
        `"${token}" は解析できませんでした。定義されている繰り返しパターンで指定してください。`,
      ),
    );
  }
}
