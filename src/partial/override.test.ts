import {
  assertArrayEquals,
  assertFalse,
  assertIdentical,
  assertInstanceOf,
  assertObjectEquals,
  assertTrue,
  assertUndefined,
} from "@kensio/smartass";
import { describe, it } from "vitest";
import { override } from "./override.js";

const onDeploy = (): string => "deployed";

describe("Override", () => {
  interface Stack {
    name: string;
    connection?: { url: string };
  }

  it("sets a property to undefined when the override gives undefined", () => {
    const result = override<Stack>(
      { name: "Stack", connection: { url: "https://example.com" } },
      { connection: undefined },
    );

    assertTrue("connection" in result);
    assertUndefined(result.connection);
  });

  it("keeps the default when the override omits the property", () => {
    const result = override<Stack>(
      { name: "Stack", connection: { url: "https://example.com" } },
      {},
    );

    assertIdentical(result.connection?.url, "https://example.com");
  });

  it("sets a nested property to undefined", () => {
    interface Job {
      schedule: { cron: string; timezone?: string };
    }

    const result = override<Job>(
      { schedule: { cron: "* * * * *", timezone: "Europe/London" } },
      { schedule: { timezone: undefined } },
    );

    assertIdentical(result.schedule.cron, "* * * * *");
    assertUndefined(result.schedule.timezone);
  });

  it("replaces an array rather than merging it by index", () => {
    interface Collection {
      tags: string[];
    }

    const result = override<Collection>(
      { tags: ["A", "B", "C"] },
      {
        tags: ["Z"],
      },
    );

    assertArrayEquals(result.tags, ["Z"]);
  });

  it("leaves the base object unchanged", () => {
    const base = { name: "Stack", connection: { url: "https://example.com" } };

    override<Stack>(base, { name: "Other", connection: { url: "other" } });

    assertObjectEquals(base, {
      name: "Stack",
      connection: { url: "https://example.com" },
    });
  });

  it("leaves the overrides object unchanged", () => {
    const overrides = { name: "Other" };

    override<Stack>(
      { name: "Stack", connection: { url: "https://example.com" } },
      overrides,
    );

    assertObjectEquals(overrides, { name: "Other" });
  });

  it("copies nested objects out of the base and the overrides", () => {
    const base = { connection: { url: "https://example.com" } };
    const overrides = { connection: { url: "https://other.example.com" } };

    const result = override<Stack>({ name: "Stack", ...base }, overrides);

    assertFalse(result.connection === base.connection);
    assertFalse(result.connection === overrides.connection);
  });

  it("keeps values that are not plain objects as they are", () => {
    class Connection {
      constructor(readonly url: string) {}

      ping(): string {
        return "pong";
      }
    }

    interface Deployment {
      connection: Connection;
      onDeploy: () => string;
    }

    const result = override<Deployment>(
      { connection: new Connection("https://example.com"), onDeploy },
      {},
    );

    assertInstanceOf(result.connection, Connection);
    assertIdentical(result.connection.ping(), "pong");
    assertIdentical(result.onDeploy, onDeploy);
  });

  it("ignores an override key that would set the prototype", () => {
    const overrides = JSON.parse('{"__proto__": {"polluted": true}}') as Record<
      string,
      unknown
    >;

    const result = override({ name: "Stack" }, overrides);

    assertUndefined(Object.getPrototypeOf(result).polluted);
    assertUndefined(({} as Record<string, unknown>)["polluted"]);
  });
});
