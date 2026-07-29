import { assertArrayLength, assertIdentical } from "@kensio/smartass";
import { describe, it } from "vitest";
import { AsyncMappedFactory } from "./async-mapped-factory.js";

describe("Async Mapped Factory", () => {
  interface NewUser {
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  }

  interface User extends NewUser {
    id: string;
  }

  interface UserStore {
    users: User[];
    insert: (newUser: NewUser) => Promise<User>;
  }

  const makeUserStore = (): UserStore => {
    const users: User[] = [];

    return {
      users,
      insert: (newUser) => {
        const user = { ...newUser, id: `user-${String(users.length + 1)}` };
        users.push(user);

        return Promise.resolve(user);
      },
    };
  };

  const makeUserFactory = (): AsyncMappedFactory<
    NewUser,
    User,
    { store: UserStore }
  > =>
    new AsyncMappedFactory<NewUser, User, { store: UserStore }>(
      () => ({
        name: "Foo User",
        contact: {
          email: "foo@example.com",
          phone: "123456789",
        },
      }),
      (newUser, { store }) => store.insert(newUser),
    );

  it("creates an entity in the system given as a dependency", async () => {
    const store = makeUserStore();

    const user = await makeUserFactory().make({}, { store });

    assertIdentical(user.id, "user-1");
    assertIdentical(user.name, "Foo User");
    assertArrayLength(store.users, 1);
  });

  it("applies overrides to the input before creating the entity", async () => {
    const store = makeUserStore();

    const user = await makeUserFactory().make({ name: "Foobar" }, { store });

    assertIdentical(user.name, "Foobar");
    assertIdentical(user.contact.email, "foo@example.com");
  });

  it("allows overriding a nested input property", async () => {
    const store = makeUserStore();

    const user = await makeUserFactory().make(
      { contact: { email: "bar@example.com" } },
      { store },
    );

    assertIdentical(user.contact.email, "bar@example.com");
    assertIdentical(user.contact.phone, "123456789");
  });

  it("creates a fresh entity for each call", async () => {
    const store = makeUserStore();
    const userFactory = makeUserFactory();

    const first = await userFactory.make({}, { store });
    const second = await userFactory.make({}, { store });

    assertIdentical(first.id, "user-1");
    assertIdentical(second.id, "user-2");
    assertArrayLength(store.users, 2);
  });

  it("takes no dependency argument when it declares no dependencies", async () => {
    const idFactory = new AsyncMappedFactory<{ prefix: string }, string>(
      () => ({ prefix: "foo" }),
      (input) => Promise.resolve(`${input.prefix}-1`),
    );

    assertIdentical(await idFactory.make(), "foo-1");
    assertIdentical(await idFactory.make({ prefix: "bar" }), "bar-1");
  });
});
