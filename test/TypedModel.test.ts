import "@wdio/globals/types";
import "./loadUi5.js";
import { expect } from "@wdio/globals";
import { TypedModel, compositeBinding } from "./dist/main.js";

describe("TypedModel", () => {
  it("should be able to get and set properties", async () => {
    const model = new TypedModel({
      hello: "world",
      count: 0,
      nested: {
        msg: "nested message",
        row: 0,
      },
    });

    model.bindTo(sap.ui.getCore());

    expect(model.path((data) => data)).toEqual("/");
    expect(model.path((data) => data.hello)).toEqual("/hello");
    expect(model.path((data) => data.nested.msg)).toEqual("/nested/msg");

    expect(model.get((data) => data.hello)).toEqual("world");
    expect(model.get((data) => data.count)).toEqual(0);
    expect(model.get((data) => data.nested)).toEqual({
      msg: "nested message",
      row: 0,
    });

    model.set((data) => data.count, 100);
    expect(model.get((data) => data.count)).toEqual(100);
  });

  it("should be able to get and set array elements", async () => {
    const model = new TypedModel({
      arr: [
        { row: 0, msg: "hello" },
        { row: 1, msg: "world" },
      ],
    });

    expect(model.path((data) => data.arr[5])).toEqual("/arr/5");
    expect(model.get((data) => data.arr[0])).toEqual({ row: 0, msg: "hello" });

    model.set((data) => data.arr[1].msg, "bye!");
    expect(model.get((data) => data.arr[1].msg)).toEqual("bye!");

    model.set((data) => data.arr[2], { row: 2, msg: "bye bye!" });
    expect(model.get((data) => data.arr[2].msg)).toEqual("bye bye!");

    expect(model.get((data) => data.arr[3].msg)).toEqual(undefined);
  });

  it("should be able to create context models", async () => {
    const model = new TypedModel({
      nested: {
        arr: [
          { name: "Yichuan", points: 20 },
          { name: "Ryan", points: 15 },
        ],
      },
    });

    const rowModel = model.createContextModel((data) => data.nested.arr[0]);

    expect(rowModel.get((_, context) => context)).toEqual({
      name: "Yichuan",
      points: 20,
    });

    expect(rowModel.get((_, context) => context.name)).toEqual("Yichuan");

    rowModel.set((_, context) => context.points, 500);
    expect(rowModel.get((_, context) => context.points)).toEqual(500);

    expect(rowModel.get((data) => data.nested.arr[0].points)).toEqual(500);
    expect(rowModel.get((data) => data.nested.arr[1].points)).toEqual(15);
  });

  it("should be able to create property bindings", async () => {
    const model = new TypedModel({
      hello: "world",
      count: 0,
    });

    const binding1 = model.binding((data) => data.hello);
    expect(binding1.path).toEqual("/hello");

    const binding2 = model
      .binding((data) => data.count)
      .map((count) => count > 0);

    expect(binding2.formatter).not.toBeUndefined();
    expect(binding2.formatter!(-1)).toEqual(false);
    expect(binding2.formatter!(1)).toEqual(true);
  });

  it("should be able to create aggregation bindings", async () => {
    const model = new TypedModel({
      arr: [
        { name: "Yichuan", points: 20 },
        { name: "Ryan", points: 15 },
      ],
    });

    const Button = class {} as typeof import("sap/m/Button").default;
    const binding = model.aggregationBinding(
      (data) => data.arr,
      (id, model) =>
        new Button(id, {
          text: model.binding((_, context) => context.name),
        })
    );

    expect(binding.path).toEqual("/arr");
    expect(binding.factory).not.toBeUndefined();
  });

  it("should be able to create expression bindings", async () => {
    const model = new TypedModel({
      message: "Hello World",
      name: "Yichuan",
      visitors: 10,
    });

    const binding1 = compositeBinding(
      [
        model.binding((data) => data.message),
        model.binding((data) => data.name),
      ],
      (message, name) => `${message}, ${name}!`
    );

    expect(binding1.parts?.length).toEqual(2);
    expect(binding1.formatter!("Hello", "Dan")).toEqual("Hello, Dan!");

    const binding2 = binding1.map((msg) => msg.length);
    expect(binding2.parts?.length).toEqual(2);
    expect(binding2.formatter!("Hello", "Dan")).toEqual("Hello, Dan!".length);
  });
});
