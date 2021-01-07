import React, { useEffect } from 'react';
import { REQUEST_TOKEN, API_AUTHORIZE_SPOTIFY } from './Api.js';
import useFetch from './Hooks/useFetch';
import './App.css';

const App = () => {
  const { request } = useFetch();

  // const myRequest = async (url, options) => {
  //   const responseData = await request(url, options);
  //   window.localStorage.getItem('wideToken', data.access_token);
  //   window.localStorage.getItem('wideRefreshToken', data.refresh_token);
  // };

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code && !window.localStorage.getItem('wideRefreshToken')) {
      const { url, options } = REQUEST_TOKEN(code);

      async function myRequest(url, options) {
        const { response, json } = await request(url, options);
        if (response.ok) {
          window.localStorage.setItem('wideToken', json.access_token);
          window.localStorage.setItem('wideRefreshToken', json.refresh_token);
        }
      }
      myRequest(url, options);
    } else {
      console.log(
        'refresh token',
        window.localStorage.getItem('wideRefreshToken'),
      );
      console.log('token', window.localStorage.getItem('wideToken'));
    }
  }, [request]);

  const link_authorize = API_AUTHORIZE_SPOTIFY();

  return (
    <>
      {window.localStorage.getItem('wideToken') && <p>Acessou</p>}
      <a href={link_authorize}>Conectar</a>
    </>
  );
};

export default App;
