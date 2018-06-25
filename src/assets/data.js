const prodAPI = 'https://messaging-app-server.herokuapp.com';
const devAPI = 'http://localhost:8000';

const apiURL = process.env.REACT_APP_ENV === 'development' ? devAPI : prodAPI;
// const apiURL = prodAPI;

export default {
  apiURL,
};
