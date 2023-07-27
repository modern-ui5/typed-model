import type {
  AggregationBindingInfo,
  PropertyBindingInfo,
} from "sap/ui/base/ManagedObject";
import { TypedModel } from "./TypedModel.js";

const Base = <T>(): new () => T => class {} as any;

export class TypedPropertyBindingInfo<T>
  extends Base<PropertyBindingInfo>()
  implements PropertyBindingInfo
{
  constructor(public readonly typedModel?: TypedModel<any, any>) {
    super();
  }

  map<U>(f: (value: T) => U): TypedPropertyBindingInfo<U> {
    const result = new TypedPropertyBindingInfo<U>(this.typedModel);
    const formatter = this.formatter;

    Object.assign(result, this);
    result.formatter =
      formatter == null ? f : (...args: unknown[]) => f(formatter(...args));

    return result;
  }
}

export class TypedAggregationBindingInfo<T>
  extends Base<AggregationBindingInfo>()
  implements AggregationBindingInfo
{
  constructor(public readonly typedModel: TypedModel<any, any>) {
    super();
  }
}

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
