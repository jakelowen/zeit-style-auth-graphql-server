import register from "./registerResolver";
import verify from "./verifyResolver";
import me from "./meResolver";

export default {
  Query: {
    me
  },
  Mutation: {
    register,
    verify
  }
};
