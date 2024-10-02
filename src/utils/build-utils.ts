import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { ObjectUtils } from "./object-utils";
import { RegexUtils } from "./regex-utils";
import { StringUtils } from "./string-utils";

export class GQLSchemaGenerator {
  private _inputFilePath: string;
  private _rawSchema: string;
  private _queries: string = "";
  private _mutations: string = "";
  private _outPath: string;

  public schema: string = "";

  constructor(inputFilePath: string, outPath: string) {
    this._inputFilePath = inputFilePath;
    this._outPath = outPath;
    this._rawSchema = this.getSchema();
  }

  public transformSchema() {
    process.stdout.write(`${chalk.yellow("❯")} Transforming schema...`);
    this._queries = this.generateQueries();
    this._mutations = this.generateMutations();
    this.schema = this._queries + this._mutations;
    process.stdout.write(`\r${chalk.green("✔")} Transforming schema...\n`);
  }

  public saveSchema() {
    process.stdout.write(`${chalk.yellow("❯")} Saving schema...`);
    fs.writeFileSync(path.join(this._outPath), this.schema);
    process.stdout.write(`\r${chalk.green("✔")} Saving schema...\n`);
  }

  private getSchema() {
    return StringUtils.stripComments(
      fs.readFileSync(this._inputFilePath, "utf-8")
    );
  }

  private generateQueries() {
    return this.generateOperations(RegexUtils.querySchemaRegex, "query");
  }

  private generateMutations() {
    return this.generateOperations(RegexUtils.mutationSchemaRegex, "mutation");
  }

  private generateOperations(regex: RegExp, operation: "query" | "mutation") {
    const operationSchema = OperationBuilder.formatOperations(
      this._rawSchema,
      regex
    );

    const operationMatches = [
      ...operationSchema.matchAll(RegexUtils.operationRegex),
    ];

    let content = "";

    for (const match of operationMatches) {
      content += this.buildOperation(match[1], match[2], match[3], operation);
    }

    return content;
  }

  private buildOperation(
    operationName: string,
    operationArgs: string,
    operationReturn: string,
    operationType: "query" | "mutation"
  ) {
    let operation = "";

    const inputArgs = OperationBuilder.buildInputArguments(operationArgs);
    const functionArgs = OperationBuilder.buildFunctionArguments(operationArgs);
    const functionName = OperationBuilder.buildFunctionName(operationName);
    const functionReturn = OperationBuilder.buildOperationReturn(
      this._rawSchema,
      operationReturn
    );

    operation += `${operationType} ${functionName}${inputArgs} {\n`;
    operation += `${StringUtils.indent(1)}${operationName}${functionArgs} ${functionReturn || "\n"}`;
    operation += "}\n\n";

    return operation;
  }
}

export class OperationBuilder {
  static formatOperations(_rawSchema: string, regex: RegExp) {
    let operationSchema = (_rawSchema.match(regex) || [""])[0];

    const args = operationSchema.matchAll(RegexUtils.operationArgsRegex) || [];

    for (const match of args) {
      operationSchema = operationSchema.replace(
        match[1],
        match[1]
          .replace(/(\n+)/gi, "")
          .trim()
          .replace(/(\s{2,})/gi, ", ")
      );
    }

    return operationSchema;
  }

  static buildInputArguments(input?: string) {
    if (!input) {
      return "";
    }

    const inputArgs = RegexUtils.keyValuePairs(input)
      ?.map((arg) => {
        const [key, value] = arg.split(":");
        return `$${key.trim()}: ${value.trim()}`;
      })
      .join(", ");

    return `(${inputArgs})`;
  }

  static buildFunctionArguments(input?: string) {
    if (!input) {
      return "";
    }

    const functionArgs = RegexUtils.keyValuePairs(input)
      ?.map((arg) => {
        const [key] = arg.split(":");
        return `${key.trim()}: $${key.trim()}`;
      })
      .join(", ");

    return `(${functionArgs})`;
  }

  static buildFunctionName(name: string) {
    return StringUtils.capitalize(name);
  }

  static buildOperationReturn(_rawSchema: string, operationReturn: string) {
    const typeSchema = RegexUtils.findTypeSchema(_rawSchema, operationReturn);
    const unionTypeSchema = RegexUtils.findUnionType(
      _rawSchema,
      operationReturn
    );

    if (!typeSchema && !unionTypeSchema) {
      return "";
    }

    return ObjectUtils.convertTypeToObject(
      _rawSchema,
      typeSchema || unionTypeSchema,
      1
    );
  }
}
