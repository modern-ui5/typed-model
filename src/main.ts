import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Path, createPathBuilder, getPath } from "./path_builder.js";
import {
  TypedAggregationBindingInfo,
  TypedPropertyBindingInfo,
} from "./typed_binding_info.js";
import ManagedObject, {
  AggregationBindingInfo,
  PropertyBindingInfo,
} from "sap/ui/base/ManagedObject";

export * from "./typed_binding_info.js";

export type PathBuilder<T, C, U> = (data: Path<T>, context: Path<C>) => Path<U>;

const rootPathBuilder = createPathBuilder<any>("/");
const relativePathBuilder = createPathBuilder<any>("");

export class TypedModel<T extends object, C extends object = never> {
  constructor(data: T);
  constructor(model: JSONModel);
  constructor(name: string | undefined, data: T);
  constructor(name: string | undefined, model: JSONModel, context?: Context);
  constructor(...args: unknown[]) {
    if (args.length === 1) args = [undefined, args[0]];

    const [name, data, context] = args as [
      name: string | undefined,
      data: T | JSONModel,
      context?: Context
    ];

    this.name = name;
    this.model = data instanceof JSONModel ? data : new JSONModel(data);
    this.context = context;
  }

  static unique<T extends object>(data: T): TypedModel<T>;
  static unique<T extends object>(model: JSONModel): TypedModel<T>;
  static unique<T extends object>(data: T | JSONModel): TypedModel<T> {
    return new TypedModel(crypto.randomUUID(), data as T);
  }

  readonly name: string | undefined;
  readonly model: JSONModel;
  readonly context?: Context;

  setOn(obj: { setModel(model: JSONModel, name?: string): void }): this {
    obj.setModel(this.model, this.name);
    return this;
  }

  createContextModel<U>(
    f: PathBuilder<T, C, U>
  ): U extends object ? TypedModel<T, U> : never {
    const path = this.path(f);
    const newContext = this.model.createBindingContext(path, this.context)!;
    const model = new TypedModel<T, U extends object ? U : never>(
      this.name,
      this.model,
      newContext
    ) as U extends object ? TypedModel<T, U> : never;

    return model;
  }

  path<U>(f: PathBuilder<T, C, U>): string {
    return getPath(
      f(rootPathBuilder as Path<T>, relativePathBuilder as Path<C>)
    );
  }

  get<U>(f: PathBuilder<T, C, U>): U {
    const path = this.path(f);
    return this.model.getProperty(path, this.context);
  }

  set<U>(f: PathBuilder<T, C, U>, value: U): this {
    const path = this.path(f);
    this.model.setProperty(path, value, this.context);
    return this;
  }

  getData(): T {
    return this.model.getData();
  }

  setData(data: T, merge?: boolean): this {
    this.model.setData(data, merge);
    return this;
  }

  binding<U>(
    f: PathBuilder<T, C, U>,
    opts?: Omit<PropertyBindingInfo, "path" | "model" | "value" | "parts">
  ): TypedPropertyBindingInfo<U> {
    const result = new TypedPropertyBindingInfo<U>(this);

    result.path = this.path(f);

    return Object.assign(result, opts);
  }

  aggregationBinding<U extends ManagedObject>(
    f: PathBuilder<T, C, U[]>,
    factory: (id: string, model: TypedModel<T, U>) => U,
    opts?: Omit<
      AggregationBindingInfo,
      "path" | "model" | "template" | "factory"
    >
  ): TypedAggregationBindingInfo<U> {
    const result = new TypedAggregationBindingInfo<U>(this);

    result.path = this.path(f);
    result.factory = (id, context) =>
      factory(id, new TypedModel<T, U>(this.name, this.model, context));

    return Object.assign(result, opts);
  }
}
