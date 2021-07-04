import { History, createBrowserHistory } from "history";

// export type ReadonlyBrowserHistory = Readonly<History<IHistoryState>>;
const browserHistory: History<IHistoryState> = createBrowserHistory();

export default browserHistory;
