export function API_AUTHORIZE_SPOTIFY() {
  const client_id = '01f9c1ff73124a728402ba1a817c489f';
  const redirect_uri = 'http://localhost:3000/';
  const scopes = 'user-read-private%20user-read-email%20playlist-modify-public';

  return `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes}&state=34fFs29kd09`;
}

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
