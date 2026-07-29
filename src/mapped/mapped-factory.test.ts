import { assertIdentical } from "@kensio/smartass";
import { describe, it } from "vitest";
import { MappedFactory } from "./mapped-factory.js";

describe("Mapped Factory", () => {
  interface ProductUrlComponents {
    protocol: "https";
    host: string;
    path: {
      resourceType: string;
      resourceId: string;
    };
    query: {
      version: string;
      includeMetadata: boolean;
    };
  }

  type ProductUrl = `https://${string}`;

  it("maps generated input into an output value", () => {
    const productUrlFactory = new MappedFactory<
      ProductUrlComponents,
      ProductUrl
    >(
      () => ({
        protocol: "https",
        host: "api.example.com",
        path: {
          resourceType: "products",
          resourceId: "product-1",
        },
        query: {
          version: "v1",
          includeMetadata: false,
        },
      }),
      (components) =>
        `${components.protocol}://${components.host}/${components.path.resourceType}/${components.path.resourceId}?version=${components.query.version}&includeMetadata=${String(components.query.includeMetadata)}`,
    );

    const item = productUrlFactory.make();

    assertIdentical(
      item,
      "https://api.example.com/products/product-1?version=v1&includeMetadata=false",
    );
  });

  it("applies overrides to the input before mapping", () => {
    const productUrlFactory = new MappedFactory<
      ProductUrlComponents,
      ProductUrl
    >(
      () => ({
        protocol: "https",
        host: "api.example.com",
        path: {
          resourceType: "products",
          resourceId: "product-1",
        },
        query: {
          version: "v1",
          includeMetadata: false,
        },
      }),
      (components) =>
        `${components.protocol}://${components.host}/${components.path.resourceType}/${components.path.resourceId}?version=${components.query.version}&includeMetadata=${String(components.query.includeMetadata)}`,
    );

    const item = productUrlFactory.make({
      path: {
        resourceId: "product-2",
      },
      query: {
        includeMetadata: true,
      },
    });

    assertIdentical(
      item,
      "https://api.example.com/products/product-2?version=v1&includeMetadata=true",
    );
  });

  it("passes dependencies to the mapper function", () => {
    interface PathComponents {
      resourceType: string;
      resourceId: string;
    }

    const productUrlFactory = new MappedFactory<
      PathComponents,
      ProductUrl,
      { host: string }
    >(
      () => ({
        resourceType: "products",
        resourceId: "product-1",
      }),
      (components, { host }) =>
        `https://${host}/${components.resourceType}/${components.resourceId}`,
    );

    const item = productUrlFactory.make(
      { resourceId: "product-2" },
      { host: "api.example.com" },
    );

    assertIdentical(item, "https://api.example.com/products/product-2");
  });

  it("allows mapping to a non-object output type", () => {
    interface PriceComponents {
      amount: number;
      currency: string;
    }

    const priceFactory = new MappedFactory<PriceComponents, string>(
      () => ({
        amount: 10,
        currency: "GBP",
      }),
      (components) => `${components.currency} ${String(components.amount)}`,
    );

    const item = priceFactory.make({ amount: 20 });

    assertIdentical(item, "GBP 20");
  });
});
