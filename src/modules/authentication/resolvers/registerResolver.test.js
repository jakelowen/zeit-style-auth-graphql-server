import faker from "faker";
import { makeExecutableSchema } from "apollo-server";
import { graphql } from "graphql";
import bcrypt from "bcryptjs";
// import { text } from "body-parser";
import db from "../../../knex";
import generateContext from "../../../utils/generateContext";
import generateSchema from "../../../utils/genSchema";
import redis from "../../../redis";

const schema = makeExecutableSchema(generateSchema());

beforeAll(async () => db.migrate.latest({ directory: "src/migrations" }));
beforeEach(async () =>
  Promise.all([db.raw("TRUNCATE TABLE users CASCADE"), redis.flushdb()]));
afterAll(async () => db.destroy());

describe("register resolver", () => {
  test("happy path", async () => {
    const sendEmail = jest.fn(() => Promise.resolve());
    const context = await generateContext();
    context.connectors.sendEmail = sendEmail;

    const email = faker.internet.email();

    const query = `
      mutation {
        register(input:{email:"${email}"}) {
          code
          success
          message
          securityCode
        }
      }
    `;

    await graphql(schema, query, {}, context);

    // expect email to have been sent (mock)
    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail.mock.calls[0][0].to).toBe(email);
    expect(sendEmail.mock.calls[0][0].html).toEqual(
      expect.stringContaining(`/${email.toLowerCase()}`)
    );
    expect(sendEmail.mock.calls[0][0].txt).toEqual(
      expect.stringContaining(`/${email.toLowerCase()}`)
    );

    // expect verification code in email to exist
    const myRegExp = /<a href="[a-z]+\/[a-z]+\/[a-zA-Z_0-9@.]+\/([a-z,0-9-]+)">[a-zA-Z]+<\/a>/g;
    const matches = myRegExp.exec(sendEmail.mock.calls[0][0].txt);
    const key = matches[1];
    expect(key).not.toBeNull();

    // expect key to point to valid hash of email
    const emailHash = await redis.get(key);
    expect(await bcrypt.compare(email.toLowerCase(), emailHash)).toBe(true);

    // expect user to exist in email
    const dbUser = await db("users")
      .where({ email: email.toLowerCase() })
      .first();
    expect(dbUser).not.toBeNull();
  });
});
