import { CodegenConfig } from "@graphql-codegen/cli";
import { ReactApolloRawPluginConfig } from "@graphql-codegen/typescript-react-apollo/typings/config";
import * as path from "path";
import { cwd } from "process";

export type XYZCodegenOptions = {
  outDir: string;
  graphqlEndpoint: string;
  config?: ReactApolloRawPluginConfig;
} & Omit<CodegenConfig, "schema" | "config" | "generates">;

export function defineConfig({
  outDir,
  graphqlEndpoint,
  documents,
  config,
  ...rest
}: XYZCodegenOptions) {
  const outPath = path.join(cwd(), outDir);
  const schemaPath = path.join(outPath, "schema.gql");
  const hooksPath = path.join(outPath, "index.ts");

  const pullSchema: CodegenConfig = {
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

  const _documents = Array.isArray(documents) ? documents : [documents];

  const buildSchema: CodegenConfig = {
    ...rest,
    schema: graphqlEndpoint,
    hooks: {
      afterAllFileWrite: ["prettier --write"],
      ...rest.hooks,
    },
    generates: {
      [hooksPath]: {
        plugins: [
          "typescript",
          "typescript-operations",
          "typescript-react-apollo",
        ],
        config,
        documents: [path.join(outPath, "**", "*.gql"), ..._documents],
      },
    },
  };

  return { pullSchema, buildSchema, schemaPath, outPath };
}
