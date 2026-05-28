# @kensio/part-factory

Part Factory is a minimalist object factory pattern with strong typing. Create object factories with
suitable default value generation, then override the defaults as needed per test case.

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
import { faker } from '@faker-js/faker';

const fooFactory = new DynamicFactory<Foo>({
  name: () => faker.word.noun(),
  size: () => faker.number.int({ max: 100 }),
});

const defaultFoo = fooFactory.make();
// { name: "external", size: 42 }

const myFoo = fooFactory.make({ size: 20 });
// { name: "front", size: 20 }
```

## VariantFactory

We can create variant factories that apply preset variations to objects made by a base factory.

```typescript
import { DynamicFactory, VariantFactory } from "@kensio/part-factory";
import { faker } from '@faker-js/faker';

const animalFactory = new DynamicFactory<Foo>({
  name: () => faker.animal.type(),
  size: () => faker.number.int({ max: 100 }),
});

const zebraFactory = new VariantFactory<Foo>(baseFactory, {
  name: "Zebra",
});

const zebra = zebraFactory.make();
// { name: "Zebra", size: 42 }

const largeZebra = zebraFactory.make({ size: 100 });
// { name: "Zebra", size: 100 }
```

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
