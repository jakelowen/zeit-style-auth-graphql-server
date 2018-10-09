import { ApolloServer } from "apollo-server";
// import { ApolloServer } from "apollo-server-express";
// import express from "express";
import { formatError } from "apollo-errors";
import genSchema from "./utils/genSchema";
import generateContext from "./utils/generateContext";
import cors from "cors";

import "dotenv/config";

let whiteList = [];
if (process.env.NODE_ENV === "development") {
  whiteList.push("http://localhost:1234");
}

const server = new ApolloServer({
  ...genSchema(),
  formatError,
  cors: { origin: whiteList, credentials: true },
  context: ({ req }) => generateContext(req)
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
