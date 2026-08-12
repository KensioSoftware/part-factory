import { describe, it } from "vitest";
import { StaticFactory } from "./static-factory.js";

const start = (): string => "started";
import {
  assertArrayEquals,
  assertIdentical,
  assertObjectEquals,
  assertUndefined,
} from "@kensio/smartass";

describe("Static Factory", () => {
  interface Foo {
    name: string;
    price: number;
  }

  it("creates items with static values", () => {
    const fooFactory = new StaticFactory<Foo>({ name: "Foobar", price: 10 });

    const item = fooFactory.make();

    assertIdentical(item.name, "Foobar");
    assertIdentical(item.price, 10);
  });

  it("allows overriding static default value", () => {
    const fooFactory = new StaticFactory<Foo>({ name: "Foobar", price: 10 });

    const item = fooFactory.make({ name: "Foobar 2" });

    assertIdentical(item.name, "Foobar 2");
    assertIdentical(item.price, 10);
  });

  it("allows overriding a nested property", () => {
    interface NestedFoo {
      name: string;
      details: {
        price: number;
        currency: string;
      };
    }

    const fooFactory = new StaticFactory<NestedFoo>({
      name: "Foobar",
      details: {
        price: 10,
        currency: "GBP",
      },
    });

    const item = fooFactory.make({ details: { price: 20 } });

    assertIdentical(item.name, "Foobar");
    assertIdentical(item.details.price, 20);
    assertIdentical(item.details.currency, "GBP");
  });

  it("allows overriding an array property", () => {
    interface Collection {
      name: string;
      tags: string[];
    }

    const collectionFactory = new StaticFactory<Collection>({
      name: "Foo Collection",
      tags: ["A", "B"],
    });

    const item = collectionFactory.make({ tags: ["C"] });

    assertIdentical(item.name, "Foo Collection");
    assertArrayEquals(item.tags, ["C"]);
  });

  it("allows overriding a value with undefined", () => {
    interface OptionalFoo {
      name: string;
      price?: number;
    }

    const fooFactory = new StaticFactory<OptionalFoo>({
      name: "Foobar",
      price: 10,
    });

    const item = fooFactory.make({ price: undefined });

    assertIdentical(item.name, "Foobar");
    assertUndefined(item.price);
  });

  it("does not modify the overrides it is given", () => {
    const fooFactory = new StaticFactory<Foo>({ name: "Foobar", price: 10 });
    const overrides = { price: 20 };

    fooFactory.make(overrides);

    assertObjectEquals(overrides, { price: 20 });
  });

  it("keeps default values that cannot be cloned", () => {
    interface Service {
      name: string;
      start: () => string;
    }

    const serviceFactory = new StaticFactory<Service>({
      name: "Foo Service",
      start,
    });

    const item = serviceFactory.make();

    assertIdentical(item.start, start);
  });

  it("does not leak nested object mutations between created items", () => {
    interface NestedFoo {
      name: string;
      details: {
        price: number;
        currency: string;
      };
    }

    const fooFactory = new StaticFactory<NestedFoo>({
      name: "Foobar",
      details: {
        price: 10,
        currency: "GBP",
      },
    });

    const firstItem = fooFactory.make();
    const secondItem = fooFactory.make();

    firstItem.details.price = 20;
    firstItem.details.currency = "EUR";

    assertIdentical(secondItem.details.price, 10);
    assertIdentical(secondItem.details.currency, "GBP");
  });
});
