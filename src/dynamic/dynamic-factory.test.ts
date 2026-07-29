import { describe, it } from "vitest";
import {
  assertIdentical,
  assertNumberBetween,
  assertUuidV4,
} from "@kensio/smartass";
import { DynamicFactory } from "./dynamic-factory.js";

describe("Dynamic Factory", () => {
  interface Foo {
    name: string;
    price: number;
  }

  it("creates items with dynamic default values", () => {
    const fooFactory = new DynamicFactory<Foo>(() => ({
      name: crypto.randomUUID(),
      price: Math.random() * 100,
    }));

    const item = fooFactory.make();

    assertUuidV4(item.name);
    assertNumberBetween(item.price, 0, 100);
  });

  it("allows overriding dynamic default value", () => {
    const fooFactory = new DynamicFactory<Foo>(() => ({
      name: crypto.randomUUID(),
      price: Math.random() * 100,
    }));

    const item = fooFactory.make({ name: "Foobar" });

    assertIdentical(item.name, "Foobar");
    assertNumberBetween(item.price, 0, 100);
  });

  it("allows overriding a nested property", () => {
    interface NestedFoo {
      name: string;
      details: {
        price: number;
        currency: string;
      };
    }

    const fooFactory = new DynamicFactory<NestedFoo>(() => ({
      name: "Foobar",
      details: {
        price: Math.random() * 100,
        currency: "GBP",
      },
    }));

    const item = fooFactory.make({ details: { price: 20 } });

    assertIdentical(item.name, "Foobar");
    assertIdentical(item.details.price, 20);
    assertIdentical(item.details.currency, "GBP");
  });

  it("gives dependencies to the defaults maker", () => {
    const fooFactory = new DynamicFactory<Foo, { currency: string }>(
      (_overrides, { currency }) => ({
        name: `Foobar in ${currency}`,
        price: 10,
      }),
    );

    const item = fooFactory.make({}, { currency: "GBP" });

    assertIdentical(item.name, "Foobar in GBP");
    assertIdentical(item.price, 10);
  });
});
