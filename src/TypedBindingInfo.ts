import type {
  AggregationBindingInfo,
  PropertyBindingInfo,
} from "sap/ui/base/ManagedObject";
import { TypedModel } from "./TypedModel.js";

const Base = <T>(): new () => T => class {} as any;

/**
 * Represents a property binding info object with property type.
 *
 * Use {@link TypedModel.binding} or {@link expressionBinding} to create an instance.
 */
export class TypedPropertyBindingInfo<T>
  extends Base<PropertyBindingInfo>()
  implements PropertyBindingInfo
{
  /**
   * @private
   */
  constructor(
    /**
     * The corresponding {@link TypedModel} of the binding.
     */
    public readonly typedModel?: TypedModel<any, any>
  ) {
    super();
  }

  /**
   * Transforms the property value with the given function `f`.
   *
   * @param f The transformation function
   */
  map<U>(f: (value: T) => U): TypedPropertyBindingInfo<U> {
    const result = new TypedPropertyBindingInfo<U>(this.typedModel);
    const formatter = this.formatter;

    Object.assign(result, this);
    result.formatter =
      formatter == null ? f : (...args: unknown[]) => f(formatter(...args));

    return result;
  }
}

/**
 * Represents an aggregation binding info object with aggregation type.
 *
 * Use {@link TypedModel.aggregationBinding} to create an instance.
 */
export class TypedAggregationBindingInfo<T>
  extends Base<AggregationBindingInfo>()
  implements AggregationBindingInfo
{
  /**
   * @private
   */
  constructor(
    /**
     * The corresponding {@link TypedModel} of the binding.
     */
    public readonly typedModel: TypedModel<any, any>
  ) {
    super();
  }
}

/**
 * Creates a new composite property binding info object with the given `parts` and `formatter`.
 *
 * @param parts The source bindings.
 * @param formatter Function to convert source data into a property value.
 * @param opts The binding options.
 */
export function expressionBinding<
  const P extends readonly [
    TypedPropertyBindingInfo<unknown>,
    ...TypedPropertyBindingInfo<unknown>[]
  ],
  T
>(
  parts: P,
  formatter: (
    ...values: {
      [K in keyof P]: P[K] extends TypedPropertyBindingInfo<infer T>
        ? T
        : never;
    }
  ) => T,
  opts?: Omit<PropertyBindingInfo, "path" | "model" | "value" | "parts">
): TypedPropertyBindingInfo<T> {
  const result = new TypedPropertyBindingInfo<T>();

  result.parts = parts as any;
  result.formatter = formatter;

  return Object.assign(result, opts);
}
