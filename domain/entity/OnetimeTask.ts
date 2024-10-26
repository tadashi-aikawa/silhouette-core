import { type DateTime, Entity } from "owlelia";

interface Props {
  name: string;
  date: DateTime;
}

export class OnetimeTask extends Entity<Props> {
  static of(props: Props): OnetimeTask {
    return new OnetimeTask(props.name, props);
  }

  get name(): string {
    return this._props.name;
  }

  get date(): DateTime {
    return this._props.date;
  }
}
