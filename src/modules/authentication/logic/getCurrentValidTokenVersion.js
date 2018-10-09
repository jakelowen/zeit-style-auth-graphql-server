import { userTokenVersionPrefix } from "../constants";

export default async (id, redis) => {
  let tokenVersion = await redis.get(`${userTokenVersionPrefix}${id}`);

  if (!tokenVersion) {
    await redis.set(`${userTokenVersionPrefix}${id}`, 1);
    tokenVersion = "1";
  }
  return tokenVersion;
};
