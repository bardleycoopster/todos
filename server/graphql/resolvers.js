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
    ownerId: row.owner_id,
    shared: row.is_shared,
  };
};

const convertDbRowToListItem = (row) => {
  if (!row) {
    return row;
  }

  return {
    id: row.id,
    listId: row.list_id,
    name: row.name,
    description: row.description,
    complete: row.complete,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUpdatedUserId: row.last_user_id,
  };
};

const getUser = async (userId) => {
  let result;
  try {
    result = await db.query("select * from users where id = $1;", [userId]);
  } catch (e) {
    throw new ApolloError("Invalid user query", "BAD_REQUEST");
  }

  if (result.rowCount === 0) {
    throw new ApolloError("User not found", "BAD_REQUEST");
  }

  return {
    id: userId,
    username: result.rows[0].username,
    email: result.rows[0].email,
  };
};

const getList = async (listId, userId) => {
  let result;
  try {
    result = await db.query(
      `select 
          l.*, 
          coalesce(sl.owner_id, l.user_id) as owner_id,
          sl.owner_id is not null as is_shared
      from lists l
      left join shared_lists sl on l.user_id = sl.owner_id
      where l.id = $1 and (l.user_id = $2 or sl.guest_id = $2)
      limit 1;`,
      [listId, userId]
    );
  } catch (e) {
    throw new ApolloError("DB query failed", "BAD_REQUEST");
  }

  if (result.rowCount === 0) {
    throw new ApolloError("List not found", "BAD_REQUEST");
  }

  return convertDbRowToList(result.rows[0]);
};

const getLists = async (userId) => {
  let result;
  try {
    result = await db.query(
      `select 
            l.*, 
            coalesce(sl.owner_id, l.user_id) as owner_id,
            sl.owner_id is not null as is_shared 
          from lists l
          left join shared_lists sl 
              on sl.owner_id = l.user_id
          where l.user_id = $1 or sl.guest_id = $1;`,
      [userId]
    );
  } catch (e) {
    throw new ApolloError("DB query failed", "BAD_REQUEST");
  }

  return result.rows.map(convertDbRowToList);
};

const getListItems = async (listId) => {
  let result;
  try {
    result = await db.query(
      "select * from list_items where list_id = $1 order by position;",
      [listId]
    );
  } catch (e) {
    throw new ApolloError("DB query failed", "BAD_REQUEST");
  }

  return result.rows.map(convertDbRowToListItem);
};

// Provide resolver functions for your schema fields
module.exports = {
  Query: {
    user: async (_, args, { user }) => {
      return getUser(user.id);
    },
    lists: async (parent, args, { user }) => {
      return getLists(user.id);
    },
    list: async (_, { id }, { user }) => {
      return getList(id, user.id);
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
    shareLists: async (parent, { input: { username, email } }, { user }) => {
      let userResult;
      try {
        userResult = await db.query(
          "select id from users where username=$1 or email=$2 limit 1;",
          [username, email]
        );
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

      if (userResult.rowCount !== 1) {
        throw new ApolloError("User not found", "BAD_REQUEST");
      }

      const guestId = userResult.rows[0].id;

      if (guestId === user.id) {
        throw new ApolloError("Cannot share with yourself", "BAD_REQUEST");
      }

      let result;
      try {
        result = await db.query(
          `insert into shared_lists (owner_id, guest_id) 
           values ($1, $2)
           on conflict(owner_id, guest_id) do nothing;`,
          [user.id, guestId]
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
            await query(
              "update list_items set position = position + 1 where position >= $2 and list_id = $1;",
              [listId, position]
            );
            const innerResult = await query(
              "insert into list_items (list_id, description, position, last_user_id) values ($1, $2, $3, $4) returning *;",
              [listId, description, position, user.id]
            );

            await query("select nextval('list_items_position_seq');");

            return innerResult;
          });
        } else {
          result = await db.query(
            "insert into list_items (list_id, description, last_user_id) values ($1, $2, $3) returning *;",
            [listId, description, user.id]
          );
        }
      } catch (e) {
        throw new ApolloError("DB query failed", "BAD_REQUEST");
      }

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
      return getLists(parent.id);
    },
  },
  List: {
    items: async (parent, args) => {
      return getListItems(parent.id);
    },
    owner: async (parent) => {
      return getUser(parent.ownerId);
    },
  },
  ListItem: {
    lastUpdatedUser: async (parent) => {
      return getUser(parent.lastUpdatedUserId);
    },
    list: async (parent, args, { user }) => {
      return getList(parent.listId, user.id);
    },
  },
};
