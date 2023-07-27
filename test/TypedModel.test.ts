import "@wdio/globals/types";
import "./loadUi5.js";
import { expect } from "@wdio/globals";
import { TypedModel } from "../test_dist/main.js";

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
});
