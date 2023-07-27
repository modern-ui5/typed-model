import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/Context";
import type Model from "sap/ui/model/Model";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type {
  AggregationBindingInfo,
  PropertyBindingInfo,
} from "sap/ui/base/ManagedObject";

import { Path, createPathBuilder, getPath } from "./PathBuilder.js";
import {
  TypedAggregationBindingInfo,
  TypedPropertyBindingInfo,
} from "./TypedBindingInfo.js";

/**
 * A function with which a property path can be constructed using dot-notation.
 *
 * @template T The type of the model data.
 * @template C The type of the context data.
 * @template U The type of the selected property.
 */
export type PathBuilder<T, C, U> = Exclude<C, undefined> extends never
  ? (data: Path<T>) => Path<U>
  : (data: Path<T>, context: Path<C>) => Path<U>;

const rootPathBuilder = createPathBuilder<any>("/");
const relativePathBuilder = createPathBuilder<any>("");

/**
 * A strictly typed wrapper of a UI5 JSON model.
 *
 * @template T The type of the model data.
 * @template C The type of the context data or `undefined` if there's no context.
 */
export class TypedModel<
  T extends object,
  C extends object | undefined = undefined
> {
  /**
   * Constructor for a new `TypedModel` with the given data.
   *
   * @param data The data with which the model will be initialized.
   */
  constructor(data: T);
  /**
   * Constructor for a new `TypedModel` based on an existing `model` and `context`.
   *
   * @param model An existing `JSONModel`.
   * @param context An existing `Context`.
   */
  constructor(
    model: JSONModel,
    context?: Exclude<C, undefined> extends never ? undefined : Context
  );
  constructor(data: T | JSONModel, context?: Context) {
    this.model = data instanceof JSONModel ? data : new JSONModel(data);
    this.context = context as any;
  }

  /**
   * The underlying `JSONModel`.
   */
  readonly model: JSONModel;
  /**
   * The context if exists.
   */
  readonly context: Exclude<C, undefined> extends never ? undefined : Context;

  /**
   * Creates a new `TypedModel` with context based on the given path.
   *
   * @param path The property path for the context.
   */
  createContextModel<U extends object | undefined>(
    path: PathBuilder<T, C, U>
  ): TypedModel<T, U> {
    const newContext = this.model.createBindingContext(
      this.path(path),
      this.context
    )!;
    const model = new TypedModel<T, U>(this.model, newContext as any);

    return model;
  }

  /**
   * Sets this model on the given object with the given name.
   *
   * @param obj The UI5 object to set on.
   * @param name The name of the model which must be a non-empty string or `undefined`.
   */
  setOn(
    obj: { setModel(model: Model, name?: string): void },
    name?: string
  ): this {
    obj.setModel(this.model, name);
    return this;
  }

  /**
   * Transforms the given path in dot-notation into a path in slash-notation.
   *
   * @param path The path in dot-notation.
   */
  path<U>(path: PathBuilder<T, C, U>): string {
    return getPath(
      path(rootPathBuilder as Path<T>, relativePathBuilder as any)
    );
  }

  /**
   * Returns the value for the property with the given path.
   *
   * @param path The path to the property.
   */
  get<U>(path: PathBuilder<T, C, U>): U {
    return this.model.getProperty(this.path(path), this.context);
  }

  /**
   * Sets the value for the property with the given path.
   *
   * @param path The path to the property.
   * @param value The new value to be set for this property.
   * @param asyncUpdate Whether to update other bindings dependent on this property asynchronously.
   */
  set<P extends PathBuilder<T, C, unknown>>(
    path: P,
    value: P extends PathBuilder<T, C, infer U> ? U : never,
    asyncUpdate?: boolean
  ): this {
    this.model.setProperty(this.path(path), value, this.context, asyncUpdate);
    return this;
  }

  /**
   * Returns the current data of the model.
   */
  getData(): T {
    return this.model.getData();
  }

  /**
   * Sets the data of the model.
   *
   * @param data The data to set.
   * @param merge Determines whether to merge the data instead of replacing it.
   */
  setData(data: T, merge?: boolean): this {
    this.model.setData(data, merge);
    return this;
  }

  /**
   * Creates a new property binding info object.
   * 
   * @param path The path to the property.
   * @param opts The binding options.
   */
  binding<U>(
    path: PathBuilder<T, C, U>,
    opts?: Omit<PropertyBindingInfo, "path" | "value" | "parts" | "formatter">
  ): TypedPropertyBindingInfo<U> {
    const result = new TypedPropertyBindingInfo<U>(this);

    result.path = this.path(path);

    return Object.assign(result, opts);
  }

  /**
   * Creates a new aggregation binding info object.
   * 
   * @param path The path to the array property.
   * @param factory The factory function which returns a new UI5 Control with the given `id`.
   * @param opts The binding options.
   */
  aggregationBinding<U extends object, O extends ManagedObject>(
    path: PathBuilder<T, C, U[]>,
    factory: (id: string, model: TypedModel<T, U>) => O,
    opts?: Omit<AggregationBindingInfo, "path" | "template" | "factory">
  ): TypedAggregationBindingInfo<O> {
    const result = new TypedAggregationBindingInfo<O>(this);

    result.path = this.path(path);
    result.factory = (id, context) =>
      factory(id, new TypedModel<T, U>(this.model, context as any));

    return Object.assign(result, opts);
  }
}
