import * as types from '../actions/types';

const initialState = {
  // Punch In/Out states
  punchInLoading: false,
  punchOutLoading: false,
  punchInData: null,
  punchOutData: null,
  punchError: null,
  
  // History states
  historyLoading: false,
  history: [],
  historyError: null,
  
  // Today's attendance
  todayLoading: false,
  todayAttendance: null,
  todayError: null,
  
  // Status
  isCheckedIn: false,
  currentStatus: 'NOT_PUNCHED', // NOT_PUNCHED, PUNCHED_IN, PUNCHED_OUT
  lastPunchIn: null,
  lastPunchOut: null,
  location: null,
};

const attendanceReducer = (state = initialState, action) => {
  switch (action.type) {
    // Punch In
    case types.PUNCH_IN_REQUEST:
      return {
        ...state,
        punchInLoading: true,
        punchError: null,
      };
      
    case types.PUNCH_IN_SUCCESS:
      return {
        ...state,
        punchInLoading: false,
        punchInData: action.payload,
        isCheckedIn: true,
        currentStatus: 'PUNCHED_IN',
        lastPunchIn: action.payload,
        punchError: null,
      };
      
    case types.PUNCH_IN_FAIL:
      return {
        ...state,
        punchInLoading: false,
        punchError: action.payload,
      };
      
    // Punch Out
    case types.PUNCH_OUT_REQUEST:
      return {
        ...state,
        punchOutLoading: true,
        punchError: null,
      };
      
    case types.PUNCH_OUT_SUCCESS:
      return {
        ...state,
        punchOutLoading: false,
        punchOutData: action.payload,
        isCheckedIn: false,
        currentStatus: 'PUNCHED_OUT',
        lastPunchOut: action.payload,
        punchInData: null,
        punchError: null,
      };
      
    case types.PUNCH_OUT_FAIL:
      return {
        ...state,
        punchOutLoading: false,
        punchError: action.payload,
      };
      
    // Attendance History
    case types.ATTENDANCE_HISTORY_REQUEST:
      return {
        ...state,
        historyLoading: true,
        historyError: null,
      };
      
    case types.ATTENDANCE_HISTORY_SUCCESS:
      return {
        ...state,
        historyLoading: false,
        history: action.payload,
        historyError: null,
      };
      
    case types.ATTENDANCE_HISTORY_FAIL:
      return {
        ...state,
        historyLoading: false,
        historyError: action.payload,
      };
      
    // Today's Attendance
    case types.TODAY_ATTENDANCE_REQUEST:
      return {
        ...state,
        todayLoading: true,
        todayError: null,
      };
      
    case types.TODAY_ATTENDANCE_SUCCESS:
      return {
        ...state,
        todayLoading: false,
        todayAttendance: action.payload,
        isCheckedIn: action.payload?.isCheckedIn || false,
        currentStatus: action.payload?.status || 'NOT_PUNCHED',
        location: action.payload?.location || null,
        todayError: null,
      };
      
    case types.TODAY_ATTENDANCE_FAIL:
      return {
        ...state,
        todayLoading: false,
        todayError: action.payload,
      };
      
    // Reset state on logout
    case types.LOGOUT:
    case types.RESET_APP_STATE:
      return initialState;
      
    default:
      return state;
  }
};

export default attendanceReducer;