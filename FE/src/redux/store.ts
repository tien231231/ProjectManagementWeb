import authReducer from "./slice/authSlice";
import { menuSlice } from "./slice/menuSlice";
import { queryParamsSlice } from "./slice/paramsSlice";
import { projectSlice } from "./slice/projectSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
// import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["auth", "queryParams"],
  //   stateReconciler: autoMergeLevel2,
};

const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: ["error"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  project: projectSlice.reducer,
  menu: menuSlice.reducer,
  queryParams: queryParamsSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // },
    }),
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Export thunk để sử dụng ở các component bên ngoài
export * from "./thunk/userThunk";
