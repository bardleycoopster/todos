import { Pool } from "pg";
import config from "../config.json";
let dbConfig;

if (process.env.NODE_ENV === "production") {
  dbConfig = config.database.production;
} else if (process.env.NODE_ENV === "test") {
  dbConfig = config.database.test;
} else {
  dbConfig = config.database.development;
}

const pool = new Pool(dbConfig);

function query<
  R,
  I extends Array<string | number | boolean | null | undefined> = Array<
    string | number | boolean | null | undefined
  >
>(text: string, params?: I) {
  return pool.query<R, I>(text, params);
}

async function transaction(callback: Function) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    throw new Error("Unabled to acquire DB connection");
  }

  if (!client) {
    throw new Error("Unable to acquire DB client connection");
  }

  let result;
  try {
    await client.query("begin;");
    result = await callback(client.query);
    await client.query("commit;");
  } catch (e) {
    await client.query("rollback");
    throw new Error("DB transaction query failed");
  } finally {
    client.release();
  }

  return result;
}

type TestResult = { result: boolean };
async function verifyConnection(): Promise<void | Error> {
  return new Promise(async (resolve, reject) => {
    try {
      const testResult = await query<TestResult>("select 1=1 as result;");
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

const db = {
  query,
  transaction,
  verifyConnection,
};

export default db;
