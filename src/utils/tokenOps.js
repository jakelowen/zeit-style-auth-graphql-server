import * as jwt from "jsonwebtoken";
import redis from "../redis";
import { userTokenVersionPrefix } from "../modules/authentication/constants";

export const parseToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (e) {
    return {};
  }
};

export const extractTokenFromHeaderValue = authHeaderValue => {
  if (!authHeaderValue) {
    return "";
  }
  return authHeaderValue.split(" ")[1];
};

export const validateTokenVersion = async (decoded, iredis) => {
  if (decoded === {}) {
    return {};
  }
  const tokenVersion = await iredis.get(
    `${userTokenVersionPrefix}${decoded.id}`
  );
  return parseInt(tokenVersion, 10) === decoded.version ? decoded : {};
};

export default async req => {
  let user = {};
  try {
    const token = extractTokenFromHeaderValue(req.headers.authorization);
    const decoded = parseToken(token, process.env.JWT_SECRET);
    user = await validateTokenVersion(decoded, redis);
  } catch (e) {
    user = {};
  }
  return user;
};
