import { PubSub } from "apollo-server-express";

export const EVENTS = {
  LIST_ITEM_CHANGED: "LIST_ITEM_CHANGED",
  COMPLETED_LIST_ITEMS_REMOVED: "COMPLETED_LIST_ITEMS_REMOVED",
};

export default new PubSub();
