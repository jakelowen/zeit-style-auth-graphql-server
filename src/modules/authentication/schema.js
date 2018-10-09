import { gql } from "apollo-server";

export default gql`
  type User {
    email: String!
    firstName: String
    lastName: String
    permission: String
  }

  type Query {
    me: User
  }

  input RegisterMutationInput {
    email: String!
  }

  type RegisterMutationResult {
    code: String!
    success: Boolean!
    message: String!
    securityCode: String!
  }

  input VerifyMutationInput {
    email: String!
    verificationToken: String!
  }

  type VerifyMutationResult {
    code: String!
    success: Boolean!
    message: String!
    token: String
  }

  type Mutation {
    register(input: RegisterMutationInput!): RegisterMutationResult!
    verify(input: VerifyMutationInput!): VerifyMutationResult!
  }
`;
