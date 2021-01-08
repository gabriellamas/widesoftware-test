import React, { useEffect, useState } from 'react';
import {
  REQUEST_CODE_AUTHORIZATION,
  REQUEST_TOKEN,
  REFRESH_TOKEN,
  REQUEST_USER_PROFILE,
  REQUEST_PLAYLISTS,
  REQUEST_TRACKS_OF_PLAYLIST,
} from './Api.js';
import useFetch from './Hooks/useFetch';
import './App.css';

const App = () => {
  const { data, error, loading, request } = useFetch();
  const [userId, setUserId] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code && !window.localStorage.getItem('wideRefreshToken')) {
      const { url, options } = REQUEST_TOKEN(code);

      async function requestToken(url, options) {
        const { response, json } = await request(url, options);
        if (response.ok) {
          window.localStorage.setItem('wideToken', json.access_token);
          window.localStorage.setItem('wideRefreshToken', json.refresh_token);
        }
      }
      requestToken(url, options);
    } else {
      console.log('token', window.localStorage.getItem('wideToken'));
      async function requestUserProfile() {
        const { url, options } = REQUEST_USER_PROFILE(
          window.localStorage.getItem('wideToken'),
        );
        const { response, json } = await request(url, options);
        if (response.ok) {
          setUserId(json.id);
          const { url, options } = REQUEST_PLAYLISTS(
            window.localStorage.getItem('wideToken'),
          );
          const {
            response: responsePlaylists,
            json: jsonPlaylists,
          } = await request(url, options);
          if (responsePlaylists.ok) {
            const myPlaylistWithMusics = await Promise.all(
              jsonPlaylists.items.map(async (playlist) => {
                const { url, options } = REQUEST_TRACKS_OF_PLAYLIST(
                  window.localStorage.getItem('wideToken'),
                  playlist.tracks.href,
                );
                const { response, json } = await request(url, options);
                console.log('oi', response, json.items);
                return {
                  ...playlist,
                  myMusics: json.items,
                };
              }),
            );

            setPlaylists(myPlaylistWithMusics);
          }
        } else {
          const { url, options } = REFRESH_TOKEN(
            window.localStorage.getItem('wideRefreshToken'),
          );
          const { response, json } = await request(url, options);
          if (response.ok) {
            const newToken = json.access_token;
            window.localStorage.setItem('wideToken', newToken);
            requestUserProfile();
          }
        }
      }
      requestUserProfile();
    }
  }, [request]);

  const link_authorize = REQUEST_CODE_AUTHORIZATION();

  if (error) return <p>Erro: {error}</p>;
  if (loading) return <p>Carregando...</p>;
  if (data)
    return (
      <>
        {userId && (
          <>
            <p>{userId}</p>
            {/* <button onClick={handleSignOut}>Sair</button> */}
          </>
        )}
        {window.localStorage.getItem('wideToken') ? (
          <p>Acessou</p>
        ) : (
          <a href={link_authorize}>Conectar</a>
        )}
        {console.log('final', playlists)}
        {playlists && (
          <>
            <h3>Playlists</h3>
            {playlists.map((playlist) => (
              <div key={playlist.id}>
                <img
                  src={playlist.images[2].url}
                  alt={`playlist ${playlist.name}`}
                />
                <p>{playlist.name}</p>
                <ul>
                  {playlist.myMusics.map(({ track }) => (
                    <li>{track.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </>
    );
  else return null;
};

export default App;
