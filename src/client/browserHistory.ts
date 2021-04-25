import { History, createBrowserHistory } from "history";

export type ReadonlyBrowserHistory = Readonly<History<IHistoryState>>;
const browserHistory: ReadonlyBrowserHistory = createBrowserHistory();

export default browserHistory;
