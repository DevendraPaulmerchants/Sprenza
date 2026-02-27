import { combineReducers } from 'redux';
import authReducer from './authReducer';
import attendanceReducer from './attendanceReducer'; // Add this
import uiReducer from './uiReducer';

const appReducer = combineReducers({
  auth: authReducer,
  attendance: attendanceReducer, // Add this
  ui: uiReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT' || action.type === 'RESET_APP_STATE') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;