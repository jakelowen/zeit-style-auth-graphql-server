import "dotenv/config";

import faker from "faker";
import { makeExecutableSchema } from "apollo-server";
import { graphql } from "graphql";
import bcrypt from "bcryptjs";
import uuidv4 from "uuid/v4";
import jwt from "jsonwebtoken";
import db from "../../../knex";
import generateContext from "../../../utils/generateContext";
import generateSchema from "../../../utils/genSchema";
import redis from "../../../redis";
import { userTokenVersionPrefix } from "../constants";

const schema = makeExecutableSchema(generateSchema());

beforeAll(async () => db.migrate.latest({ directory: "src/migrations" }));
beforeEach(async () =>
  Promise.all([db.raw("TRUNCATE TABLE users CASCADE"), redis.flushdb()]));
afterAll(async () => db.destroy());

describe("verify resolver", () => {
  test("happy path", async () => {
    const context = await generateContext();

    const email = faker.internet.email();
    const emailHash = await bcrypt.hash(email.toLowerCase(), 10);
    const key = uuidv4();
    const userId = uuidv4();

    await redis.set(key, emailHash);
    await db("users").insert({
      email: email.toLowerCase(),
      id: userId
    });

    const query = `
      mutation {
        verify(input:{email:"${email}",  verificationToken: "${key}"}) {
          code
          success
          message
          token
        }
      }
    `;

    const response = await graphql(schema, query, {}, context);
    // verify token is present and valid
    expect(response.data.verify.token).not.toBeNull();
    const {
      data: {
        verify: { token }
      }
    } = response;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw new Error("Token is malformed");
    }

    // verify key is deleted from redis
    expect(await redis.get(key)).toBeNull();

    // make sure token version = user version
    const tokenVersion = await redis.get(
      `${userTokenVersionPrefix}${decoded.id}`
    );
    expect(decoded.version).toEqual(parseInt(tokenVersion, 10));
  });

  test("bad email", async () => {
    const context = generateContext();

    const email = faker.internet.email();
    const emailHash = await bcrypt.hash(email.toLowerCase(), 10);
    const key = uuidv4();
    const userId = uuidv4();

    await redis.set(key, emailHash);
    await db("users").insert({ email: email.toLowerCase(), id: userId });

    const query = `
      mutation {
        verify(input:{email:"bademail@test.com",  verificationToken: "${key}"}) {
          code
          success
          message
          token
        }
      }
    `;

    const response = await graphql(schema, query, {}, context);

    expect(response.data.verify).toEqual({
      code: "failBadAuth",
      success: false,
      message: "Sorry. You can not be validated. Try logging in again.",
      token: null
    });
  });

  test("bad token", async () => {
    const context = generateContext();

    const query = `
      mutation {
        verify(input:{email:"bademail@test.com",  verificationToken: "badkey"}) {
          code
          success
          message
          token
        }
      }
    `;

    const response = await graphql(schema, query, {}, context);

    expect(response.data.verify).toEqual({
      code: "failExpired",
      success: false,
      message:
        "Sorry. The link has already been used or has expired. Please login again.",
      token: null
    });
  });
});
