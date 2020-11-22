import "react-redux";

import { RootState } from "store/rootReducer";

declare module "react-redux" {
  interface DefaultRootState extends RootState {}
}
