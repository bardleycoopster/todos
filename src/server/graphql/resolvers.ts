import { ApolloError, withFilter } from "apollo-server-express";
import { Resolvers } from "types/graphql-schema-types";

import {
  getUser,
  getList,
  getLists,
  getListItems,
  getSharedListsUsers,
  login,
  createAccount,
  createList,
  deleteList,
  shareLists,
  unshareLists,
  createListItem,
  completeListItem,
  removeCompletedListItems,
} from "./controllers";
import pubsub, { EVENTS } from "./pubsub";

type Context = {
  user: {
    id: string;
    username: string;
  };
};

// Provide resolver functions for your schema fields
const resolvers: Resolvers<Context> = {
  Query: {
    user: async (parent, args, { user }) => {
      return getUser(user.id);
    },
    lists: async (_parent, _args, { user }) => {
      return getLists(user.id);
    },
    list: async (_, { id }, { user }) => {
      return getList(id, user.id);
    },
    shareListsUsers: async (parent, args, { user }) => {
      return getSharedListsUsers(user.id);
    },
  },
  Mutation: {
    login: async (_, { input: { username, password } }) => {
      return login(username, password);
    },
    createAccount: async (_, { input: { username, password, email } }) => {
      return createAccount(username, password, email);
    },
    createList: async (_, { input: { name, position } }, { user }) => {
      return createList(user.id, name, position);
    },
    updateList: async (_, { input: { name, position } }) => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
    deleteList: async (_, { id }, { user }) => {
      return deleteList(user.id, id);
    },
    shareLists: async (parent, { input: { username, email } }, { user }) => {
      return shareLists(user.id, username, email);
    },
    unshareLists: async (_, { id }, { user }) => {
      return unshareLists(user.id, id);
    },
    createListItem: async (
      parent,
      { input: { listId, description, position } },
      { user }
    ) => {
      return createListItem(user.id, listId, description, position);
    },
    updateListItem: async (parent, { input: { description, position } }) => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
    completeListItem: async (parent, { input: { id, complete } }, { user }) => {
      return completeListItem(user.id, id, complete || true);
    },
    removeCompletedListItems: async (parent, { listId }, { user }) => {
      return removeCompletedListItems(user.id, listId);
    },
  },
  Subscription: {
    listItemChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.LIST_ITEM_CHANGED),
        ({ listItemChanged: listItem }, variables) => {
          return listItem.listId === variables.listId;
        }
      ),
    },
    completedListItemsRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.COMPLETED_LIST_ITEMS_REMOVED),
        ({ listId }, variables) => {
          return listId === variables.listId;
        }
      ),
    },
  },
  User: {
    lists: async (parent, args) => {
      return getLists(parent.id);
    },
  },
  List: {
    items: async (parent, args) => {
      return getListItems(parent.id);
    },
    owner: async (parent) => {
      return getUser(parent.ownerId!);
    },
  },
  ListItem: {
    lastUpdatedUser: async (parent) => {
      if (parent.lastUpdatedUserId) {
        return getUser(parent.lastUpdatedUserId);
      } else {
        return null;
      }
    },
    list: async (parent, args, { user }) => {
      return getList(parent.listId, user.id);
    },
  },
};

export default resolvers;
