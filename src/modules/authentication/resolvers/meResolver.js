import db from "../../../knex";

export default async (root, args, { user }) => {
  if (!user || !user.id) {
    return null;
  }
  return db("users")
    .where({ id: user.id })
    .first();
};
