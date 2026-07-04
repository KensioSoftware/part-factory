import { describe, it } from "vitest";
import { StaticFactory } from "./static-factory.js";
import { assertArrayEquals, assertIdentical } from "@kensio/smartass";

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
    assertArrayEquals(item.tags, ["C", "B"]);
  });
});
