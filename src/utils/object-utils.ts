import { RegexUtils } from "./regex-utils";
import { StringUtils } from "./string-utils";

export class ObjectUtils {
  static convertTypeToObject(
    _rawSchema: string,
    typeSchema: string | string[],
    depth = 0
  ) {
    let str = "";

    if (Array.isArray(typeSchema)) {
      let fragment = "";
      for (const t of typeSchema) {
        fragment += this.createInlineFragment(_rawSchema, t, depth);
      }

      str += `{\n${fragment}${StringUtils.indent(depth + 1)}}\n`;
    } else {
      const keyValuePairs = RegexUtils.keyValuePairs(typeSchema);

      if (!keyValuePairs?.length) {
        return "\n";
      }

      str += "{\n";

      for (const keyValuePair of keyValuePairs) {
        const [key, value] = keyValuePair.split(":");

        const subTypeSchema = RegexUtils.findTypeSchema(_rawSchema, value);
        const unionTypeSchema = RegexUtils.findUnionType(_rawSchema, value);

        str += `${StringUtils.indent(depth + 1)}${key}`;

        const subType = this.convertTypeToObject(
          _rawSchema,
          subTypeSchema || unionTypeSchema,
          depth + 1
        );

        if (subType) {
          str += ` ${subType}`;
        }
      }

      str += `${StringUtils.indent(depth)}}\n`;
    }

    return str;
  }

  static createInlineFragment(
    _rawSchema: string,
    typeName: string,
    depth: number
  ) {
    const type = RegexUtils.findTypeSchema(_rawSchema, typeName);

    if (type) {
      let str = "";
      str += `${StringUtils.indent(depth + 1)}... on ${typeName} `;
      str += this.convertTypeToObject(_rawSchema, type, depth + 1);

      return str;
    }
  }
}
