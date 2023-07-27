import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Path, createPathBuilder, getPath } from "./PathBuilder.js";
import {
  TypedAggregationBindingInfo,
  TypedPropertyBindingInfo,
} from "./TypedBindingInfo.js";
import ManagedObject, {
  AggregationBindingInfo,
  PropertyBindingInfo,
} from "sap/ui/base/ManagedObject";
import Model from "sap/ui/model/Model";

export type PathBuilder<T, C, U> = (data: Path<T>, context: Path<C>) => Path<U>;

const rootPathBuilder = createPathBuilder<any>("/");
const relativePathBuilder = createPathBuilder<any>("");

export class TypedModel<
  T extends object,
  C extends object | undefined = never
> {
  constructor(data: T);
  constructor(model: JSONModel, context?: Context);
  constructor(data: T | JSONModel, context?: Context) {
    this.model = data instanceof JSONModel ? data : new JSONModel(data);
    this.context = context;
  }

  readonly model: JSONModel;
  readonly context?: Context;

  createContextModel<U extends object | undefined>(
    f: PathBuilder<T, C, U>
  ): TypedModel<T, U> {
    const path = this.path(f);
    const newContext = this.model.createBindingContext(path, this.context)!;
    const model = new TypedModel<T, U>(this.model, newContext);

    return model;
  }

  setOn(
    obj: { setModel(model: Model, name?: string): void },
    name?: string
  ): this {
    obj.setModel(this.model, name);
    return this;
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

  set<P extends PathBuilder<T, C, unknown>>(
    f: P,
    value: P extends PathBuilder<T, C, infer U> ? U : never
  ): this {
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
    opts?: Omit<PropertyBindingInfo, "path" | "value" | "parts" | "formatter">
  ): TypedPropertyBindingInfo<U> {
    const result = new TypedPropertyBindingInfo<U>(this);

    result.path = this.path(f);

    return Object.assign(result, opts);
  }

  aggregationBinding<U extends object, O extends ManagedObject>(
    f: PathBuilder<T, C, U[]>,
    factory: (id: string, model: TypedModel<T, U>) => O,
    opts?: Omit<AggregationBindingInfo, "path" | "template" | "factory">
  ): TypedAggregationBindingInfo<O> {
    const result = new TypedAggregationBindingInfo<O>(this);

    result.path = this.path(f);
    result.factory = (id, context) =>
      factory(id, new TypedModel<T, U>(this.model, context));

    return Object.assign(result, opts);
  }
}
