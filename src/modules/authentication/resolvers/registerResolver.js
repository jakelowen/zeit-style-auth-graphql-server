import uuidv4 from "uuid/v4";
import bcrypt from "bcryptjs";
import db from "../../../knex";
import generateSecurityCode from "../../../utils/securityCode";
import redis from "../../../redis";
import html from "../../../email/templates/magicLogin/html";
import subject from "../../../email/templates/magicLogin/subject";
import text from "../../../email/templates/magicLogin/text";

export default async (root, args, context) => {
  const { email } = args.input;
  const {
    connectors: { sendEmail }
  } = context;
  const lowerCaseEmail = email.toLowerCase();

  // check if email exists in record
  const dbUser = await db("users")
    .where({ email: lowerCaseEmail })
    .first();

  // if not add it
  if (!dbUser) {
    await db("users").insert({ email: lowerCaseEmail });
  }

  // Generate a memorable readable token. I.e.  number 2-99 Adjective noun(s) - 88 Sad Ducks to display to the user.
  const securityCode = generateSecurityCode();

  // generate a bcrypt hash using the email like a password, store it in redis as value. Key is just uuid.Expiration of 24 hours.Return key as part of mutations result.
  const key = uuidv4();
  const emailHash = await bcrypt.hash(lowerCaseEmail, 10);
  await redis.set(key, emailHash, "EX", 60 * 60 * 24);

  // construct url
  const url = `${process.env.FRONTEND_HOST}/verify/${lowerCaseEmail}/${key}`;

  // Send email with human readable key, and link like  frontEndhost.com?token=123-456-789-123&email=foo@bar.com
  const messageData = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: subject(),
    html: html(url, securityCode),
    txt: text(url, securityCode)
  };
  await sendEmail(messageData);

  // return response from mutation
  return {
    code: "ok",
    success: true,
    message:
      "A message has been sent to your email with a magic link you need to click to log in.",
    securityCode
  };
};
