export function REQUEST_CODE_AUTHORIZATION() {
  const client_id = '01f9c1ff73124a728402ba1a817c489f';
  const redirect_uri = 'http://localhost:3000/';
  const scopes = 'user-read-private%20user-read-email%20playlist-modify-public';

  return `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scopes}&state=34fFs29kd09`;
}

export function REQUEST_TOKEN(code) {
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

  return {
    url: 'https://accounts.spotify.com/api/token',
    options: {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    },
  };
}

export function REFRESH_TOKEN(refreshToken) {
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
  urlencoded.append('grant_type', 'refresh_token');
  urlencoded.append('refresh_token', `${refreshToken}`);

  return {
    url: 'https://accounts.spotify.com/api/token',
    options: {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    },
  };
}

export function REQUEST_USER_PROFILE(token) {
  let myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  return {
    url: 'https://api.spotify.com/v1/me',
    options: {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    },
  };
}

export function REQUEST_PLAYLISTS(token) {
  let myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  return {
    url: 'https://api.spotify.com/v1/me/playlists',
    options: {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    },
  };
}

export function REQUEST_TRACKS_OF_PLAYLIST(token, url) {
  let myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  return {
    url: `${url}`,
    options: {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    },
  };
}

export function SEARCH_TRACK(token, trackName) {
  let myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  return {
    url: `https://api.spotify.com/v1/search?q=${trackName}&type=track`,
    options: {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    },
  };
}

export function ADD_TRACK_TO_PLAYLIST(token, playlistId, trackUri) {
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', `Bearer ${token}`);

  return {
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackUri}`,
    options: {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
    },
  };
}

export function DELETE_TRACK_FROM_PLAYLIST(token, playlistId, trackUri) {
  let myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);
  myHeaders.append('Content-Type', 'application/json');

  let raw = JSON.stringify({
    tracks: [{ uri: `${trackUri}` }],
  });

  return {
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    options: {
      method: 'DELETE',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    },
  };
}
