import { assertIdentical } from "@kensio/smartass";
import { describe, it } from "vitest";
import { StaticFactory } from "../static/static-factory.js";
import { VariantFactory } from "./variant-factory.js";

describe("Variant Factory", () => {
  interface Foo {
    name: string;
    price: number;
  }

  it("creates items with preset variant overrides", () => {
    const fooFactory = new StaticFactory<Foo>({ name: "Foobar", price: 10 });
    const variantFactory = new VariantFactory<Foo>(fooFactory, {
      name: "Foobar 2",
    });

    const item = variantFactory.make();

    assertIdentical(item.name, "Foobar 2");
    assertIdentical(item.price, 10);
  });

  it("allows overriding non-variant value", () => {
    const fooFactory = new StaticFactory<Foo>({ name: "Foobar", price: 10 });
    const variantFactory = new VariantFactory<Foo>(fooFactory, {
      name: "Foobar 2",
    });

    const item = variantFactory.make({ price: 20 });

    assertIdentical(item.name, "Foobar 2");
    assertIdentical(item.price, 20);
  });

  it("allows overriding preset variant value", () => {
    const fooFactory = new StaticFactory<Foo>({ name: "Foobar", price: 10 });
    const variantFactory = new VariantFactory<Foo>(fooFactory, {
      name: "Foobar 2",
    });

    const item = variantFactory.make({ name: "Foobar 3" });

    assertIdentical(item.name, "Foobar 3");
    assertIdentical(item.price, 10);
  });

  it("allows overriding a nested property", () => {
    interface Product {
      sku: string;
      metadata: {
        tags: {
          featured: boolean;
          clearance: boolean;
        };
        supplier: string;
      };
    }

    const productFactory = new StaticFactory<Product>({
      sku: "SKU-1",
      metadata: {
        tags: {
          featured: false,
          clearance: false,
        },
        supplier: "Acme",
      },
    });
    const variantFactory = new VariantFactory<Product>(productFactory, {
      metadata: {
        tags: {
          featured: true,
        },
      },
    });

    const item = variantFactory.make({
      metadata: {
        tags: {
          clearance: true,
        },
      },
    });

    assertIdentical(item.sku, "SKU-1");
    assertIdentical(item.metadata.tags.featured, true);
    assertIdentical(item.metadata.tags.clearance, true);
    assertIdentical(item.metadata.supplier, "Acme");
  });
});
