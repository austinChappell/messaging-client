const apiURL = process.env.REACT_APP_SERVER_URL;

const post = async(url, body) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      method: 'POST',
    });
    return await response.json();
  } catch (err) {
    throw err;
  }
}

const fbAuth = async(body) => {
  const url = `${apiURL}/api/auth/fb_login`;
  return await post(url, body);
}

const googleAuth = async (body) => {
  const url = `${apiURL}/api/auth/google_login`;
  return await post(url, body);
}

const loginUser = async (token) => {
  const url = `${apiURL}/api/auth/verify_token`;
  return await post(url, {token});
}

export default {
  fbAuth,
  googleAuth,
  loginUser,
}
