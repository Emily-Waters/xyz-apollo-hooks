export class StringUtils {
  static indent(depth: number, char = "  ") {
    return char.repeat(depth);
  }

  static stripComments(val?: string) {
    if (!val) {
      return "";
    }

    const commentRegex = /#.*|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"/g;

    val = val.replace(commentRegex, "").replace(/\n\s*\n/g, "\n");
    val = val.replace(/@.*/gi, "");

    return val;
  }

  static capitalize(val: string) {
    return val.charAt(0).toUpperCase() + val.slice(1);
  }
}
