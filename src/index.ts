import { generate } from "@graphql-codegen/cli";
import * as path from "path";
import { cwd } from "process";
import { GQLSchemaGenerator } from "./utils/build-utils";

export type GenerateSchemaOptions = {
  outDir: string;
  graphqlEndpoint: string;
  config?: {
    maybeValue?: string;
    withHooks?: boolean;
    withRefetchFn?: boolean;
  };
};

export function generateSchema({
  outDir = "src/__generated__",
  graphqlEndpoint = "http://localhost:3000/graphql",
  config: {
    maybeValue = "T | undefined",
    withHooks = true,
    withRefetchFn = true,
  } = {
    maybeValue: "T | undefined",
    withHooks: true,
    withRefetchFn: true,
  },
}: GenerateSchemaOptions) {
  const outPath = path.join(cwd(), outDir);
  const schemaPath = path.join(outPath, "schema", "schema.gql");
  const hooksPath = path.join(outPath, "hooks");

  generate(
    {
      overwrite: true,
      schema: graphqlEndpoint,
      hooks: {
        afterAllFileWrite: ["prettier --write"],
      },
      generates: {
        [schemaPath]: {
          plugins: ["schema-ast"],
        },
      },
    },
    true
  )
    .then(() => {
      const generator = new GQLSchemaGenerator(schemaPath, schemaPath);
      generator.transformSchema();
      generator.saveSchema();
    })
    .then(() => {
      generate(
        {
          overwrite: true,
          schema: graphqlEndpoint,
          hooks: {
            afterAllFileWrite: ["prettier --write"],
          },
          generates: {
            [path.join(hooksPath, "index.ts")]: {
              plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-apollo",
              ],
              config: {
                withHooks,
                withRefetchFn,
                maybeValue,
              },
              documents: path.join(outPath, "**", "*.gql"),
            },
          },
        },
        true
      );
    });
}
