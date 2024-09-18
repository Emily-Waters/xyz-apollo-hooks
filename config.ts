import { generateSchema } from "./src";

const config = generateSchema({
  graphqlEndpoint: "http://localhost:3000/graphql",
  outDir: "src/__generated__",
});

export default config;
