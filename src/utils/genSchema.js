import { mergeTypes, mergeResolvers } from "merge-graphql-schemas";

// types
import AuthType from "../modules/authentication/schema";

// resolvers
import AuthResolver from "../modules/authentication/resolvers";

export default () => {
  const typeDefs = mergeTypes([AuthType], { all: true });

  const resolvers = mergeResolvers([AuthResolver]);

  return {
    typeDefs,
    resolvers
  };
};
