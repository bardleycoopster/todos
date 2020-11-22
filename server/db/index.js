const { Pool } = require("pg");
const config = require("../config");
let dbConfig;

if (process.env.NODE_ENV === "production") {
  dbConfig = config.database.production;
} else if (process.env.NODE_ENV === "test") {
  dbConfig = config.database.test;
} else {
  dbConfig = config.database.development;
}

const pool = new Pool(dbConfig);

function query(text, params) {
  return pool.query(text, params);
}

async function transaction(callback) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    throw new Error({ message: "Unabled to acquire DB connection" });
  }

  if (!client) {
    throw new Error({ message: "Unable to acquire DB client connection" });
  }

  let result;
  try {
    console.log("begin");
    await client.query("begin;");
    console.log("start callback");
    result = await callback(client.query);
    console.log("commit");
    await client.query("commit;");
  } catch (e) {
    await client.query("rollback");
    throw new Error({ message: "DB transaction query failed" });
  } finally {
    console.log("release");
    client.release();
  }

  console.log("return result");
  return result;
}

async function verifyConnection() {
  return new Promise(async (resolve, reject) => {
    try {
      const testResult = await query("select 1=1 as result;");
      if (testResult.rows[0].result) {
        resolve();
      } else {
        reject(new Error("Failed to verify db connection."));
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  query,
  transaction,
  verifyConnection,
};
