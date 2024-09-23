import { CodegenConfig } from "@graphql-codegen/cli";
import * as path from "path";
import { cwd } from "process";

export type XYZCodegenOptions = {
  outDir: string;
  graphqlEndpoint: string;
  config?: {
    maybeValue?: string;
    withHooks?: boolean;
    withRefetchFn?: boolean;
  };
};

export function defineConfig({
  outDir,
  graphqlEndpoint,
  config: {
    maybeValue = "T | undefined",
    withHooks = true,
    withRefetchFn = true,
  } = {
    maybeValue: "T | undefined",
    withHooks: true,
    withRefetchFn: true,
  },
}: XYZCodegenOptions) {
  const outPath = path.join(cwd(), outDir);
  const schemaPath = path.join(outPath, "schema.gql");
  const hooksPath = path.join(outPath, "index.ts");

  const pullSchema: CodegenConfig = {
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
  };

  const buildSchema: CodegenConfig = {
    overwrite: true,
    schema: graphqlEndpoint,
    hooks: {
      afterAllFileWrite: ["prettier --write"],
    },
    generates: {
      [hooksPath]: {
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
  };

  return { pullSchema, buildSchema, schemaPath, outPath };
}
