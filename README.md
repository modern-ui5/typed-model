# UI5 TypedModel

[![API Reference](https://img.shields.io/badge/api-reference-blue?logo=typescript&logoColor=white)](https://modern-ui5.github.io/ui5-typed-model/modules.html)

A strictly typed wrapper of a UI5 JSON model.

## Installation

Use npm to install:

```
npm install ui5-typed-model
```

Please note that this library works with TypeScript v5.0 or higher and depends
on the [official ESM-style UI5 types](https://sap.github.io/ui5-typescript/)
`@openui5/types` or `@sapui5/types` which will not be automatically installed.

Furthermore, a code transformation is needed to transform UI5-style ESM imports
into valid UI5 code, either with Babel and
[babel-plugin-ui5-esm](https://github.com/modern-ui5/babel-plugin-ui5-esm) or
[babel-plugin-transform-modules-ui5](https://github.com/ui5-community/babel-plugin-transform-modules-ui5/tree/main).

## Usage

### Creating a Model

Create a new `TypedModel` with an underlying `JSONModel` by calling the
constructor function and optionally provide a type:

```ts
import { TypedModel } from "ui5-typed-model";

interface Model {
  message: string;
  name: string;
  contacts: {
    name: string;
    email: string;
  }[];
}

const model = new TypedModel<Model>({
  message: "Greetings",
  name: "Universe",
  contacts: [
    { name: "Yichuan", email: "me@site.com" },
    { name: "Ryan", email: "you@site.com" },
  ],
});

// Binding the model to core for simplicity
model.bindTo(sap.ui.getCore());
```

You can safely get and set property values using typed path builders:

```ts
const name: string = model.get((data) => data.name);
const contactEmail: string | undefined = model.get(
  (data) => data.contacts[0].email
);

model.set((data) => data.message, "Hello");
```

### Data Binding

There are convenience methods to create `PropertyBindingInfo` and
`AggregationBindingInfo` objects:

```ts
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";

// ...

const text = new Text();

text.bindProperty(
  "text",
  model.binding((data) => data.message)
);

const vbox = new VBox();

vbox.bindAggregation(
  "items",
  model.aggregationBinding(
    (data) => data.contacts,
    (id, model) => {
      const text = new Text(id);

      text.setBindingContext(model.context);
      text.bindProperty(
        "text",
        model.binding((_, context) => context.email)
      );

      return text;
    }
  )
);
```

### Data Transformation

You can use `map` to transform bindings:

```ts
const text = new Text();

text.bindProperty(
  "text",
  model
    .binding((data) => data.message)
    .map((message) => `${message}! And Goodbye!`)
);
```

It is possible to create composite bindings with the helper function
`expressionBinding`:

```ts
import { compositeBinding } from "ui5-typed-model";

// ...

const text = new Text();

text.bindProperty(
  "text",
  compositeBinding(
    [model.binding((data) => data.message), model.binding((data) => data.name)],
    (message, name) => `${message}, ${name}!`
  )
);
```
