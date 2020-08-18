import { authConstants } from "../../constants";
import Cookies from "universal-cookie";
import { userService, accountService } from "../../services";
import { history, getTokens } from "../../utils";
import { errorActions } from ".";
const cookies = new Cookies();
//plain actions

const initializeUserRequest = () => {
  return {
    type: authConstants.INITIALIZE_REQUEST,
  };
};

const initializeUserSuccess = (payload) => {
  return {
    type: authConstants.INITIALIZE_SUCCESS,
    payload: payload,
  };
};

const initializeUserFailure = () => {
  return {
    type: authConstants.INITIALIZE_ERROR,
  };
};

const loginRequest = () => {
  return {
    type: authConstants.LOGIN_REQUEST,
  };
};

const loginSuccess = (user) => {
  return {
    type: authConstants.LOGIN_SUCCESS,
    payload: user,
  };
};

const loginFailure = () => {
  return {
    type: authConstants.LOGIN_ERROR,
  };
};

const registerRequest = () => {
  return {
    type: authConstants.REGISTER_REQUEST,
  };
};

const registerSuccess = (user) => {
  return {
    type: authConstants.REGISTER_SUCCESS,
    payload: user,
  };
};

const registerFailure = () => {
  return {
    type: authConstants.REGISTER_ERROR,
  };
};

//thunk

const logout = () => async (dispatch) => {
  try{
    const { REACT_APP_LOCALACCESS, REACT_APP_REFRESHTOKEN } = process.env;
    dispatch(initializeUserRequest());
    localStorage.removeItem(REACT_APP_LOCALACCESS);
    cookies.remove(REACT_APP_REFRESHTOKEN);
    dispatch(initializeUserFailure());
  }
  catch(err){
    console.log(err.response);
    dispatch(initializeUserFailure());
    dispatch(errorActions.setErrors(err.response));
  }
}
const initializeUser = () => async (dispatch) => {
 
  try {
    const { REACT_APP_LOCALACCESS, REACT_APP_REFRESHTOKEN } = process.env;
    //requestı kaldırdım çünkü her saydfada initial oldugu ıcın requestte herşey sıfırlanıyor. Sonuç çıkana kadar işler olmuyor. Sonradan düzenleme yapıp ekleyince düzeldi gibi
    dispatch(initializeUserRequest());
    const user = await accountService.getCurrentUser();
    const { accessToken, refreshToken } = getTokens();
    console.log(accessToken + "heyyy " + refreshToken);
    const payload = {
      refresh_token: refreshToken,
      access_token: accessToken,
      data: user,
    };
    localStorage.setItem(REACT_APP_LOCALACCESS,accessToken);

    dispatch(initializeUserSuccess(payload));
  } catch (err) {
    console.log(err.response);
    dispatch(initializeUserFailure());
    dispatch(errorActions.setErrors(err.response));
  }
};
const login = (user) => async (dispatch) => {
  const { REACT_APP_LOCALACCESS } = process.env;
  try {
    console.log(user);
    dispatch(loginRequest());
    const response = await userService.login(user);
    localStorage.setItem(REACT_APP_LOCALACCESS, response.access_token);

    dispatch(loginSuccess(response));
    history.push("/");
  } catch (err) {
    console.log(err.response);
    dispatch(loginFailure());
    dispatch(errorActions.setErrors(err.response));
  }
};

const loginWithGoogle = (accessToken) => async (dispatch) => {
  const { REACT_APP_LOCALACCESS } = process.env;
  try {
    dispatch(loginRequest());
    const response = await userService.loginWithGoogle(accessToken);
    console.log("response google action: ",response.access_token)
    localStorage.setItem(REACT_APP_LOCALACCESS, response.access_token);
    dispatch(loginSuccess(response));
    history.push("/");
  } catch (err) {
    console.log(err.response);
    dispatch(loginFailure());
    dispatch(errorActions.setErrors(err.response));
  }
};

const register = (user) => async (dispatch) => {
  const { REACT_APP_LOCALACCESS } = process.env;
  try {
    dispatch(registerRequest());
    const response = await userService.register(user);
 
    console.log(response.data)
    console.log(response)
    dispatch(registerSuccess(response.data));
    console.log("hey")
    localStorage.setItem(REACT_APP_LOCALACCESS, response.access_token);
  } catch (err) {
    console.log(err.data);
    dispatch(registerFailure());
    dispatch(errorActions.setErrors(err.data, err.status));
  }
};

export const authActions = {
  initializeUser,
  login,
  loginWithGoogle,
  register,
  loginRequest,
  loginSuccess,
  registerRequest,
  registerSuccess,
  registerFailure,
  initializeUserFailure,
  logout
};
