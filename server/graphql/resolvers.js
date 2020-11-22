const { ApolloError } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const crypto = require("../utils/crypto");
const db = require("../db");
const config = require("../config.json");

const convertDbRowToList = (row) => {
  if (!row) {
    return row;
  }

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const convertDbRowToListItem = (row) => {
  if (!row) {
    return row;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    complete: row.complete,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUpdatedUser: row.last_user_id,
  };
};

// Provide resolver functions for your schema fields
module.exports = {
  Query: {
    user: async (_, args, { user }) => {
      if (!user) {
        throw new ApolloError("Not authenticated", "BAD_REQUEST");
      }

      let result;
      try {
        result = await db.query("select * from users where id = $1;", [
          user.id,
        ]);
      } catch (e) {
        throw new ApolloError("Invalid user query", "BAD_REQUEST");
      }

      if (result.rowCount === 0) {
        throw new ApolloError("User not found", "BAD_REQUEST");
      }

      return {
        id: user.id,
        username: user.username,
        email: result.rows[0].email,
      };
    },
    list: async (_, { id }, { user }) => {
      if (!user) {
        throw new ApolloError("Not authenticated", "BAD_REQUEST");
      }

      let result;
      try {
        result = await db.query("select * from lists where id = $1;", [id]);
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      if (result.rowCount === 0) {
        throw new ApolloError("List not found", "BAD_REQUEST");
      }

      return convertDbRowToList(result.rows[0]);
    },
  },
  Mutation: {
    login: async (_, { input: { username, password } }) => {
      if (!username || !password) {
        throw new ApolloError("Missing username or password", "BAD_REQUEST");
      }

      let result;
      try {
        result = await db.query(
          `select id, username, password from users where username = $1 limit 1;`,
          [username]
        );
      } catch (e) {
        throw new ApolloError("Invalid user query", "BAD_REQUEST");
      }

      if (result.rows.length !== 1) {
        throw new ApolloError("User not found", "BAD_REQUEST");
      }

      const user = result.rows[0];

      let isVerified;
      try {
        isVerified = await crypto.verify(password, user.password);
      } catch (e) {
        throw new ApolloError("Error validating password", "BAD_REQUEST");
      }

      if (!isVerified) {
        throw new ApolloError("Invalid password", "BAD_REQUEST");
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiry,
        }
      );

      return { jwt: token };
    },
    createAccount: async (_, { input: { username, password, email } }) => {
      if (!username || !password || !email) {
        throw new ApolloError(
          "Missing username, password, or email",
          "BAD_REQUEST"
        );
      }

      let result;
      try {
        result = await db.query(
          `select id, username, password from users where username = $1 limit 1;`,
          [username]
        );
      } catch (e) {
        throw new ApolloError("Invalid user query", "BAD_REQUEST");
      }

      // user already exists
      if (result.rows.length === 1) {
        throw new ApolloError("User already exists", "BAD_REQUEST");
      }

      let key;
      try {
        key = await crypto.kdf(password);
      } catch (e) {
        throw new ApolloError("Invalid password", "BAD_REQUEST");
      }

      try {
        result = await db.query(
          `insert into users (username, password, email) values ($1, $2, $3) returning *;`,
          [username.toLowerCase(), key, email.toLowerCase()]
        );
      } catch (e) {
        throw new ApolloError("Unable to add user", "BAD_REQUEST");
      }

      const token = jwt.sign(
        { id: result.id, username: result.username },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiry,
        }
      );

      return { jwt: token };
    },
    createList: async (_, { input: { name, position } }, { user }) => {
      let result;
      try {
        result = await db.query(
          "insert into lists (user_id, name) values ($1, $2) returning *;",
          [user.id, name]
        );
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      return convertDbRowToList(result.rows[0]);
    },
    updateList: async (_, { input: { name, position } }) => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
    deleteList: async (_, { id }, { user }) => {
      let result;
      try {
        result = await db.query(
          "delete from lists where user_id = $1 and id = $2",
          [user.id, id]
        );
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      return result.rowCount === 1;
    },
    createListItem: async (
      _,
      { input: { listId, description, position } },
      { user }
    ) => {
      let result;
      try {
        if (position != null) {
          result = await db.transaction(async (query) => {
            console.log("inner query 1", listId, position);
            await query(
              "update list_items set position = position + 1 where position >= $2 and list_id = $1;",
              [listId, position]
            );
            console.log("inner query 2");
            const innerResult = await query(
              "insert into list_items (list_id, description, position, last_user_id) values ($1, $2, $3, $4) returning *;",
              [listId, description, position, user.id]
            );

            console.log("inner query 3");
            await query("select nextval('list_items_position_seq');");
            console.log("inner query end");

            return innerResult;
          });
        } else {
          result = await db.query(
            "insert into list_items (list_id, description, last_user_id) values ($1, $2, $3) returning *;",
            [listId, description, user.id]
          );
        }
      } catch (e) {
        console.log("error: ", JSON.stringify(e));
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      console.log("done", result.rows[0]);
      return convertDbRowToListItem(result.rows[0]);
    },
    updateListItem: async (parent, { input: { description, position } }) => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
    completeListItem: async (parent, { input: { id, complete } }) => {
      let result;
      try {
        result = await db.query(
          "update list_items set complete = $2 where id = $1 returning *;",
          [id, complete === false ? false : true]
        );
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }
      return convertDbRowToListItem(result.rows[0]);
    },
    removeCompletedListItems: async (parent, { listId }) => {
      let result;
      try {
        result = await db.query(
          "delete from list_items where complete = true and list_id = $1",
          [listId]
        );
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      return result.rowCount;
    },
  },
  User: {
    lists: async (parent, args) => {
      let result;
      try {
        result = await db.query("select * from lists where user_id = $1", [
          parent.id,
        ]);
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      return result.rows.map(convertDbRowToList);
    },
  },
  List: {
    items: async (parent, args) => {
      let result;
      try {
        result = await db.query(
          "select * from list_items where list_id = $1 order by position;",
          [parent.id]
        );
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      return result.rows.map(convertDbRowToListItem);
    },
    owner: async () => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
  },
  ListItem: {
    lastUpdatedUser: async () => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
    list: async () => {
      throw new ApolloError("Not Implemented", "NOT_IMPLEMENTED");
    },
  },
};
