import React, { useEffect, useState } from 'react';
import { API_AUTHORIZE_SPOTIFY } from './Api.js';
import './App.css';

const App = () => {
  async function makeRequest(code) {
    let myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
      'Basic MDFmOWMxZmY3MzEyNGE3Mjg0MDJiYTFhODE3YzQ4OWY6MWExOTgwYmIwNTY2NGY1Njg5MjQyMjZlODIwMGI4NjQ=',
    );
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    myHeaders.append(
      'Cookie',
      '__Host-device_id=AQB7PIx_RKbN48G1GturYVuWLxLHoMJAXZYmwFBxdx6qMvoC0CoeRWm7Fe_xqxO28c7I2oRq9Ns28JwryPXjxNe_9YzBJl9jA7I',
    );

    let urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'authorization_code');
    urlencoded.append('code', `${code}`);
    urlencoded.append('redirect_uri', 'http://localhost:3000/');

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    let response;
    let json;
    try {
      response = await fetch(
        'https://accounts.spotify.com/api/token',
        requestOptions,
      );
      json = await response.json();
      if (response.ok === false) throw new Error(json.message);
      window.localStorage.setItem('widetoken', json.access_token);
      window.localStorage.setItem('wideRefreshToken', json.refresh_token);
    } catch (err) {
      json = null;
    } finally {
      console.log('json', json);
    }
  }

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log('code', code);

    if (code && !window.localStorage.getItem('wideRefreshToken')) {
      makeRequest(code);
    } else {
      console.log(
        'refresh token',
        window.localStorage.getItem('wideRefreshToken'),
      );
    }
  }, []);

  const link_authorize = API_AUTHORIZE_SPOTIFY();

  return <a href={link_authorize}>Conectar</a>;
};

export default App;
