const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Date

  type User {
    id: ID!
    username: String!
    email: String!
    lists: [List!]!
  }

  type List {
    id: ID!
    owner: User!
    name: String!
    createdAt: Date!
    updatedAt: Date
    items: [ListItem!]!
  }

  type ListItem {
    id: ID!
    list: List!
    description: String!
    complete: Boolean!
    position: Int!
    createdAt: Date!
    updatedAt: Date
    lastUpdatedUser: User
  }

  input LoginInput {
    username: String!
    password: String!
  }
  type LoginResponse {
    jwt: String!
  }

  input CreateAccountInput {
    username: String!
    email: String!
    password: String!
  }
  type CreateAccountResponse {
    jwt: String!
  }

  input CreateListInput {
    name: String!
    position: Int!
  }

  input UpdateListInput {
    name: String
    position: Int
  }

  input CreateListItemInput {
    listId: ID!
    description: String!
    position: Int
  }

  input UpdateListItemInput {
    description: String
    position: Int
  }

  input CompleteListItemInput {
    id: ID!
    complete: Boolean
  }

  type Query {
    user: User
    list(id: ID!): List!
  }

  type Mutation {
    login(input: LoginInput): LoginResponse!
    createAccount(input: CreateAccountInput): CreateAccountResponse!

    createList(input: CreateListInput): List!
    updateList(input: UpdateListInput): List!
    deleteList(id: ID!): Boolean!

    createListItem(input: CreateListItemInput): ListItem!
    updateListItem(input: UpdateListItemInput): ListItem!
    completeListItem(input: CompleteListItemInput): ListItem!
    removeCompletedListItems(listId: ID!): Int!
  }
`;
