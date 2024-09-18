import { StringUtils } from "./string-utils";

export class RegexUtils {
  static querySchemaRegex = /type Query {([^}]*)}/gi;
  static mutationSchemaRegex = /type Mutation {([^}]*)}/gi;
  static operationArgsRegex = /(?:\w)*(?:\()([^)]*)(?:\))/gi;
  static operationRegex = /([\w]+)(?:(?:\()([^)]*)(?:\)))*(?::)(.*)/g;
  static cleanTypeRegex = /[\W]/gi;

  static findTypeSchema(_rawSchema: string, typeName?: string) {
    if (!typeName) {
      return "";
    }
    const cleanType = typeName.replace(this.cleanTypeRegex, "");

    const typeRegex = new RegExp(`type ${cleanType} {([^}]*)}`, "gi");
    const typeSchema = _rawSchema.match(typeRegex)?.[0];

    return typeSchema || "";
  }

  static findUnionType(_rawSchema: string, typeName?: string) {
    if (!typeName) {
      return "";
    }

    const cleanType = typeName.replace(this.cleanTypeRegex, "");
    const unionRegex = new RegExp(`(?:union ${cleanType} = )(.*)`, "g");
    const unionTypeSchema = StringUtils.stripComments(
      _rawSchema.match(unionRegex)?.[0]?.replace(unionRegex, "$1")
    ).replace(/[\s]/g, "");

    if (!unionTypeSchema.length) {
      return "";
    }

    return unionTypeSchema.split("|");
  }

  static keyValuePairs(_rawSchema: string, delimiter = ":") {
    return _rawSchema
      .split(",")
      .join("\n")
      .match(new RegExp(`\\w+${delimiter}(.*)`, "gi"));
  }
}
