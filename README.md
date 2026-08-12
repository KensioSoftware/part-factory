# <img src="https://partfactory.dev/favicon.png" alt="Part Factory logo" width="28" height="28">&nbsp;&nbsp;Part Factory test entity factory pattern

[![npm version](https://img.shields.io/npm/v/%40kensio%2Fpart-factory)](https://www.npmjs.com/package/@kensio/part-factory)
![CI](https://img.shields.io/github/actions/workflow/status/KensioSoftware/part-factory/pr.yml?label=CI)
![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/hughgrigg/73825ab37116cf8a917383e5addb3bea/raw/coverage.json)
![Node](https://img.shields.io/node/v/%40kensio%2Fpart-factory)
![TypeScript](https://img.shields.io/badge/TS-TypeScript-3178C6)
![License](https://img.shields.io/npm/l/%40kensio%2Fpart-factory)

Part Factory is a minimalist object factory pattern with strong typing. Create object factories with
suitable default value generation, then override the defaults as needed per test case.

[https://partfactory.dev/](https://partfactory.dev/ "Part Factory test entity factory pattern docs website")

## Installation

```bash
npm install @kensio/part-factory
```

## Usage

Suppose we have an object with this structure, and we want to generate valid instances for testing:

```typescript
interface Foo {
  name: string;
  size: number;
}
```

## StaticFactory

The simplest object factory has static default values which can be overridden when making objects.

```typescript
import { StaticFactory } from "@kensio/part-factory";

const fooFactory = new StaticFactory<Foo>({
  name: "Foobar",
  size: 10,
});

const defaultFoo = fooFactory.make();
// { name: "Foobar", size: 10 }

const myFoo = fooFactory.make({ size: 20 });
// { name: "Foobar", size: 20 }
```

The types in Part Factory are detailed enough for TypeScript to enforce strong typing on the
factories, object structures and overrides.

## DynamicFactory

We might want to generate dynamic values for each new object. This works well with a data generation
library such as [Faker](https://fakerjs.dev/).

```typescript
import { DynamicFactory } from "@kensio/part-factory";
import { faker } from "@faker-js/faker";

const fooFactory = new DynamicFactory<Foo>(() => ({
  name: faker.word.noun(),
  size: faker.number.int({ max: 100 }),
}));

const defaultFoo = fooFactory.make();
// { name: "external", size: 42 }

const myFoo = fooFactory.make({ size: 20 });
// { name: "front", size: 20 }
```

## VariantFactory

We can create variant factories that apply preset variations to objects made by a base factory.

```typescript
import { DynamicFactory, VariantFactory } from "@kensio/part-factory";
import { faker } from "@faker-js/faker";

const animalFactory = new DynamicFactory<Foo>(() => ({
  name: faker.animal.type(),
  size: faker.number.int({ max: 100 }),
}));

const zebraFactory = new VariantFactory<Foo>(baseFactory, {
  name: "Zebra",
});

const zebra = zebraFactory.make();
// { name: "Zebra", size: 42 }

const largeZebra = zebraFactory.make({ size: 100 });
// { name: "Zebra", size: 100 }
```

## MappedFactory

Sometimes the values you want to override are easier to represent as a structured input object, but
the value you want from the factory has a different output type.

`MappedFactory` generates the input object, applies overrides to that input object, then maps the
completed input into the final output.

```typescript
import { MappedFactory } from "@kensio/part-factory";

interface ArnComponents {
  partition: "aws";
  service: string;
  region: string;
  accountId: string;
  resourceType: string;
  resourceId: string;
}

type Arn = `arn:aws:${string}:${string}:${string}:${string}/${string}`;

const arnFactory = new MappedFactory<ArnComponents, Arn>(
  () => ({
    partition: "aws",
    service: "lambda",
    region: "eu-west-1",
    accountId: "123456789012",
    resourceType: "function",
    resourceId: "example-function",
  }),
  (components) =>
    `arn:${components.partition}:${components.service}:${components.region}:${components.accountId}:${components.resourceType}/${components.resourceId}`,
);

const defaultArn = arnFactory.make();
// "arn:aws:lambda:eu-west-1:123456789012:function/example-function"

const bucketArn = arnFactory.make({
  service: "s3",
  resourceType: "bucket",
  resourceId: "abc123def4",
});
// "arn:aws:s3:eu-west-1:123456789012:bucket/abc123def4"
```

## AsyncMappedFactory

Sometimes producing the value is asynchronous. A test entity might have to be created in a database,
a client or a simulator, or a value might have to be signed or encoded by something that returns a
promise.

`AsyncMappedFactory` works in the same way as `MappedFactory`, except that its mapping function
returns a promise, so `make` returns a promise too.

```typescript
import { AsyncMappedFactory } from "@kensio/part-factory";

interface NewUser {
  name: string;
  email: string;
}

interface User extends NewUser {
  id: string;
}

interface UserDatabase {
  insertUser(newUser: NewUser): Promise<User>;
}

const userFactory = new AsyncMappedFactory<
  NewUser,
  User,
  { database: UserDatabase }
>(
  () => ({
    name: "Foo User",
    email: "foo@example.com",
  }),
  (newUser, { database }) => database.insertUser(newUser),
);

const defaultUser = await userFactory.make({}, { database });
// { id: "user-1", name: "Foo User", email: "foo@example.com" }

const myUser = await userFactory.make(
  { email: "bar@example.com" },
  { database },
);
// { id: "user-2", name: "Foo User", email: "bar@example.com" }
```

The overrides describe what is asked for, and the return value is what comes back, so the two are
separate types in the same way as `MappedFactory`. Here the factory is given a `NewUser` to insert
and returns the `User` the database allocated an id for.

Only the mapping function is awaited. The input defaults are still built synchronously, so anything
that has to be fetched first is fetched before `make` is called, then passed in as an override or a
dependency.

## Dependencies

A factory can declare dependencies: the things its functions need that are not part of the value
being made, such as a database, a client or a piece of configuration. They are one object, passed as
the second argument after the overrides. They are given at call time rather than held by the
factory, so a factory stays a value you can share between tests without it holding any state of its
own.

`DynamicFactory` passes them to its defaults maker, after the overrides it already receives:

```typescript
const fooFactory = new DynamicFactory<Foo, { prefix: string }>(
  (_overrides, { prefix }) => ({
    name: `${prefix}-${faker.word.noun()}`,
    size: faker.number.int({ max: 100 }),
  }),
);

const myFoo = fooFactory.make({ size: 20 }, { prefix: "test" });
// { name: "test-external", size: 20 }
```

`MappedFactory` and `AsyncMappedFactory` pass them to their mapping function, after the completed
input:

```typescript
const fooLabelFactory = new MappedFactory<Foo, string, { prefix: string }>(
  () => ({ name: "Foobar", size: 10 }),
  (foo, { prefix }) => `${prefix}-${foo.name}-${String(foo.size)}`,
);

const myLabel = fooLabelFactory.make({ size: 20 }, { prefix: "test" });
// "test-Foobar-20"
```

`VariantFactory` forwards them to the factory it wraps, so a variant of a factory with dependencies
is made the same way as any other variant.

A factory declaring no dependencies takes no dependency argument, and a factory declaring them does
not compile without them.

Dependencies are used as they are given, never fetched or awaited by the factory. Whatever has to be
looked up or set up first is done before the factory is called, so the factory only ever uses what
it is handed.

It is worth typing each factory's dependencies as narrowly as it actually needs. A factory that only
inserts users should ask for the user store rather than for the whole system, or the dependencies
object becomes the shared test fixture this is meant to avoid.

## Nested structures

The overrides are partial down through the object structure. This means that we can override one
nested property without replacing the entire tree to reach that property.

```typescript
import { StaticFactory } from "@kensio/part-factory";

interface UserProfile {
  username: string;
  contact: {
    email: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      country: string;
    };
  };
}

const userProfileFactory = new StaticFactory<UserProfile>({
  username: "foo_user",
  contact: {
    email: "foo@example.com",
    phone: "123456789",
    address: {
      line1: "1 Foo Street",
      city: "London",
      country: "UK",
    },
  },
});

const userProfile = userProfileFactory.make({
  contact: {
    address: {
      city: "Manchester",
    },
  },
});

// {
//   username: "foo_user",
//   contact: {
//     email: "foo@example.com",
//     phone: "123456789",
//     address: {
//       line1: "1 Foo Street",
//       city: "Manchester",
//       country: "UK",
//     },
//   },
// }
```

## What an override sets

An override sets a property by naming it. A key that appears in the overrides
wins, and a key that is left out keeps the default. The value itself plays no
part in that decision, so a property can be overridden with `undefined`:

```typescript
import { StaticFactory } from "@kensio/part-factory";

interface Deployment {
  name: string;
  connection?: { url: string };
}

const deploymentFactory = new StaticFactory<Deployment>({
  name: "foo-stack",
  connection: { url: "https://example.com" },
});

const disconnected = deploymentFactory.make({ connection: undefined });
// { name: "foo-stack", connection: undefined }
```

This matters for tests covering the case where a value is missing. Without it,
the missing case has to be made the factory default and the ordinary case a
variant, which puts the description of the object the wrong way round.

The other side of the rule is that a value which might be `undefined` no longer
falls back to the default. To override a property only when there is something
to set, leave the key out:

```typescript
const deployment = deploymentFactory.make({
  ...(connection && { connection }),
});
```

## What an override replaces

Overrides are merged into plain objects, one key at a time, down through the
nested structure. Every other kind of value is replaced whole.

Arrays are replaced rather than merged element by element, so overriding a list
of three tags with a list of one tag gives a list of one tag:

```typescript
const collectionFactory = new StaticFactory<Collection>({
  tags: ["A", "B", "C"],
});

const collection = collectionFactory.make({ tags: ["Z"] });
// { tags: ["Z"] }
```

Class instances, `Date` objects and functions are values in their own right, so
they are handed to the made item as they are. A stub or a spy can be held in a
factory's defaults and comes back as the same object, with its methods intact.

Each made item gets its own copy of the plain objects and arrays around those
values, so mutating one item leaves the factory defaults and the other items
alone. The overrides object passed to `make` is copied in the same way and is
safe to reuse across calls.
