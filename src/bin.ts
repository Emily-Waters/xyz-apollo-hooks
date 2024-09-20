#!/usr/bin/env node

import { generate } from "@graphql-codegen/cli";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import * as tsImport from "ts-import";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { GQLSchemaGenerator } from "./utils/build-utils";

async function loadConfigTsFile(tsFilePath: string) {
  const resolvedPath = path.resolve(tsFilePath);

  try {
    return await tsImport.load(resolvedPath);
  } catch (err) {
    console.error(`Error loading config file: ${err.message}`);
    throw err;
  }
}
async function main() {
  const time = Date.now();
  const args = await yargs(hideBin(process.argv)).argv;

  const { config = "xyz-apollo.config.ts" } = args as { config?: string };
  const codegenPath = path.resolve(process.cwd(), config);

  const {
    default: { buildSchema, pullSchema, schemaPath, outPath },
  } = await loadConfigTsFile(codegenPath);

  await generate(pullSchema, true);

  const gqlGenerator = new GQLSchemaGenerator(schemaPath, schemaPath);

  gqlGenerator.transformSchema();
  gqlGenerator.saveSchema();

  await generate(buildSchema, true);
  await fs.rm(path.join(outPath, "schema.gql"), { recursive: true });
  console.log(`\r${chalk.green("✔")} Finished in ${Date.now() - time}ms\n`);
}

main().catch(console.error);
