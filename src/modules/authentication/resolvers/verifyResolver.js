import bcrypt from "bcryptjs";
import redis from "../../../redis";
import getCurrentValidTokenVersion from "../logic/getCurrentValidTokenVersion";
import generateToken from "../logic/generateToken";
import db from "../../../knex";

export default async (root, args) => {
  const {
    input: { email, verificationToken }
  } = args;

  // check redis to get value of verifyToken key
  // delete key from redis to prevent repeated attempts

  const redisOp = await redis
    .multi()
    .get(verificationToken)
    .del(verificationToken)
    .exec();

  const emailHash = redisOp[0][1];

  // if key is null - throw error
  if (!emailHash) {
    return {
      code: "failExpired",
      success: false,
      message:
        "Sorry. The link has already been used or has expired. Please login again.",
      token: null
    };
  }

  // verify hash on file matches passed email
  // if not, throw error
  if (!(await bcrypt.compare(email.toLowerCase(), emailHash))) {
    return {
      code: "failBadAuth",
      success: false,
      message: "Sorry. You can not be validated. Try logging in again.",
      token: null
    };
  }

  // get user from db
  const dbUser = await db("users")
    .where({ email: email.toLowerCase() })
    .first();
  if (!dbUser) {
    return {
      code: "failBadAuth",
      success: false,
      message: "Sorry. You can not be validated. Try logging in again.",
      token: null
    };
  }

  // if all passes, generate JWT token
  // return
  // passes all checks, proceed with login
  const currentValidTokenVersion = await getCurrentValidTokenVersion(
    dbUser.id,
    redis
  );

  const loginToken = generateToken(dbUser.id, currentValidTokenVersion);

  return {
    code: "ok",
    success: true,
    message:
      "You have been logged in. You may close this window and return to your other tab to continue.",
    token: loginToken
  };
};
