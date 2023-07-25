import JSONModel from "sap/ui/model/json/JSONModel";

const typeSym = Symbol();

export class TypedModel<T extends object> {
  [typeSym]?: T;

  readonly name: string | undefined;
  readonly model: JSONModel;

  constructor(model: JSONModel);
  constructor(name: string | undefined, model: JSONModel);
  constructor(...args: unknown[]) {
    if (args.length === 1) args = [undefined, args[0]];

    const [name, model] = args as [name: string | undefined, model: JSONModel];

    this.name = name;
    this.model = model;
  }
}
