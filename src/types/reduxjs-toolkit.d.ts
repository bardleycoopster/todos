import { RootState } from "store/rootReducer";

declare module "@reduxjs/toolkit" {
  type ThunkApiConfig = {
    state?: RootState;
    // dispatch?: AppDispatch;
    // extra?: null;
    // rejectValue?: HttpError;
  };

  // interface BaseThunkAPI
}

// interface ThunkAPIConfig extends RootState {}
