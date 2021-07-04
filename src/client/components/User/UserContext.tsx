import React from "react";

export interface IUserContext {
  id: number;
  username: string;
}

export default React.createContext<IUserContext | null>(null);
