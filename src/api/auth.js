const {
  REACT_APP_ENV,
  REACT_APP_SERVER_URL,
  REACT_APP_LOCAL_SERVER_URL,
} = process.env;

const apiURL = REACT_APP_ENV === 'development' ? REACT_APP_LOCAL_SERVER_URL : REACT_APP_SERVER_URL;

const post = async (url, body) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    method: 'POST',
  });
  if (response.ok) {
    return response.json();
  }
  return { error: 'error' };
};

const signUp = async (body) => {
  const url = `${apiURL}/api/auth/signup`;
  return await post(url, body);
};

const login = async (body) => {
  const url = `${apiURL}/api/auth/login`;
  return await post(url, body);
};

const loginUser = async (token) => {
  const url = `${apiURL}/api/auth/verify_token`;
  return await post(url, { token });
};

export default {
  loginUser,
  signUp,
  login,
};
