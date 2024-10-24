import { DateTime, Entity } from "owlelia";
import type { Repetition } from "../vo/Repetition.ts";
import { ExhaustiveError } from "../../util/errors.ts";

interface Props {
  name: string;
  repetitions: Repetition[];
  indent?: string;
  baseDate?: DateTime;
}

export class RepetitionTask extends Entity<Props> {
  static of(props: Props): RepetitionTask {
    return new RepetitionTask(props.name, props);
  }

  cloneWith(partial: Partial<Props>): RepetitionTask {
    return RepetitionTask.of({ ...this._props, ...partial });
  }

  get name(): string {
    return this._props.name;
  }

  get indent(): string {
    return this._props.indent ?? "";
  }

  /**
   * エディタに挿入する形式に変換する
   * WARN: これは必ずしもワンタイムタスクに変換されるわけではない
   */
  override toString(): string {
    // XXX: 箇条書きと会社できるタスク名の場合は、タスクではなくメタデータとして扱う
    // XXX: 設計として明らかに問題だが #4 のIssueに最小限のコストで対応するため
    // XXX: 今後、機能追加のために大きな設計/実装変更を行わなければ多分平気
    if (this.name.startsWith("- ") || this.name.startsWith("* ")) {
      return `${this.indent}${this.name}`;
    }

    return `${this.indent}- [ ] ${this.name}`;
  }

  shouldTry(date: DateTime, holidays: DateTime[]): boolean {
    return this._props.repetitions.some((r) =>
      needTaskBy(date, holidays, r, this._props.baseDate)
    );
  }
}

function needTaskBy(
  date: DateTime,
  holidays: DateTime[],
  repetition: Repetition,
  baseDate?: DateTime,
): boolean {
  let targetDate = date.clone();
  if (repetition.dayOffset !== 0) {
    targetDate = date.minusDays(repetition.dayOffset);
  }
  if (repetition.workdayOffset !== 0) {
    const targetDates = reverseOffsetWorkdays(
      date,
      repetition.workdayOffset,
      holidays,
    );
    if (targetDates.length === 0) {
      return false;
    }

    return targetDates.some((d) =>
      needTaskBy(
        d,
        holidays,
        repetition.withOffset({
          dayOffset: 0,
          workdayOffset: 0,
        }),
        baseDate,
      )
    );
  }

  if (baseDate?.isAfter(targetDate)) {
    return false;
  }

  if (!includesDay(targetDate, holidays, repetition)) {
    return false;
  }

  switch (repetition.special) {
    case undefined:
      break;
    case "beginning of month": {
      // 月初まで曜日パターンに引っかからなければOK
      let beginD = targetDate.minusDays(1);
      while (beginD.isAfterOrEquals(targetDate.replaceDay(1), true)) {
        if (includesDay(beginD, holidays, repetition)) {
          return false;
        }
        beginD = beginD.minusDays(1);
      }
      break;
    }
    case "end of month": {
      // 月末まで曜日パターンに引っかからなければOK
      let endD = targetDate.plusDays(1);
      while (endD.isBeforeOrEquals(targetDate.endOfMonth(), true)) {
        if (includesDay(endD, holidays, repetition)) {
          return false;
        }
        endD = endD.plusDays(1);
      }
      break;
    }
    default:
      throw new ExhaustiveError(repetition.special);
  }

  if (repetition.day.type === "period") {
    if (repetition.day.period === 1) {
      return true;
    }
    if (!baseDate) {
      return false;
    }
    return targetDate.diffDays(baseDate) % repetition.day.period === 0;
  }

  return repetition.day.values.includes(targetDate.day);
}

function includesDay(
  date: DateTime,
  holidays: DateTime[],
  repetition: Repetition,
): boolean {
  if (isHoliday(date, holidays)) {
    if (
      !repetition.dayOfWeekHoliday.includes(date.date.getDay()) &&
      !repetition.dayOfWeekHoliday.includes(
        date.date.getDay() + 10 * date.nthDayOfWeek,
      )
    ) {
      return false;
    }
  } else {
    if (
      !repetition.dayOfWeek.includes(date.date.getDay()) &&
      !repetition.dayOfWeek.includes(
        date.date.getDay() + 10 * date.nthDayOfWeek,
      )
    ) {
      return false;
    }
  }

  return true;
}

function isHoliday(date: DateTime, holidays: DateTime[]): boolean {
  return holidays.some((x) => x.equals(date));
}

function isWeekday(date: DateTime): boolean {
  // noinspection OverlyComplexBooleanExpressionJS
  return (
    date.isMonday ||
    date.isTuesday ||
    date.isWednesday ||
    date.isThursday ||
    date.isFriday
  );
}

function isWorkday(date: DateTime, holidays: DateTime[]): boolean {
  return isWeekday(date) && !isHoliday(date, holidays);
}

function reverseOffsetWorkdays(
  dst: DateTime,
  days: number,
  holidays: DateTime[],
): DateTime[] {
  if (!isWorkday(dst, holidays)) {
    return [];
  }

  const dates = [];
  let d = dst.clone();

  if (days > 0) {
    while (days > 0 || !isWorkday(d, holidays)) {
      if (isWorkday(d, holidays)) {
        days -= 1;
      }
      d = d.minusDays(1);
      if (days === 0) {
        dates.push(d);
      }
    }
  } else {
    while (days < 0 || !isWorkday(d, holidays)) {
      if (isWorkday(d, holidays)) {
        days += 1;
      }
      d = d.plusDays(1);
      if (days === 0) {
        dates.push(d);
      }
    }
  }

  return dates;
}
