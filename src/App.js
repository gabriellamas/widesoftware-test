import React, { useEffect, useState } from 'react';
import {
  REQUEST_CODE_AUTHORIZATION,
  REQUEST_TOKEN,
  REFRESH_TOKEN,
  REQUEST_USER_PROFILE,
  REQUEST_PLAYLISTS,
  REQUEST_TRACKS_OF_PLAYLIST,
  ADD_TRACK_TO_PLAYLIST,
  SEARCH_TRACK,
  DELETE_TRACK_FROM_PLAYLIST,
} from './Api.js';
import useFetch from './Hooks/useFetch';
import useForm from './Hooks/useForm';
import Input from './Components/Forms/Input';
import './App.css';

const App = () => {
  const { data, error, loading, request } = useFetch();
  const searchMusic = useForm();
  const [userId, setUserId] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [playlistIdUsing, setPlaylistIdUsing] = useState(undefined);
  const [tracks, setTracks] = useState(null);
  const [modalAddTrack, setModalAddTrack] = useState(false);

  async function requestToken(code) {
    const { url, options } = REQUEST_TOKEN(code);
    const { response, json } = await request(url, options);
    if (response.ok) {
      window.localStorage.setItem('wideToken', json.access_token);
      window.localStorage.setItem('wideRefreshToken', json.refresh_token);
    }
  }

  async function requestUserProfileAndPlaylists() {
    const { url, options } = REQUEST_USER_PROFILE(
      window.localStorage.getItem('wideToken'),
    );
    const { response, json } = await request(url, options);
    if (response.ok) {
      setUserId(json.id);
      requestUserPlaylists();
    } else {
      const { url, options } = REFRESH_TOKEN(
        window.localStorage.getItem('wideRefreshToken'),
      );
      const { response, json } = await request(url, options);
      if (response.ok) {
        const newToken = json.access_token;
        window.localStorage.setItem('wideToken', newToken);
        requestUserProfileAndPlaylists();
      }
    }
  }
  async function requestUserPlaylists() {
    const { url, options } = REQUEST_PLAYLISTS(
      window.localStorage.getItem('wideToken'),
    );
    const { response: responsePlaylists, json: jsonPlaylists } = await request(
      url,
      options,
    );
    if (responsePlaylists.ok) {
      const myPlaylistWithMusics = await Promise.all(
        jsonPlaylists.items.map(async (playlist) => {
          const { url, options } = REQUEST_TRACKS_OF_PLAYLIST(
            window.localStorage.getItem('wideToken'),
            playlist.tracks.href,
          );
          const { response, json } = await request(url, options);
          if (response.ok) {
            return {
              ...playlist,
              myMusics: json.items,
            };
          }
        }),
      );

      setPlaylists(myPlaylistWithMusics);
    }
  }

  async function handleSubmitSearch(event) {
    event.preventDefault();
    const { url, options } = SEARCH_TRACK(
      window.localStorage.getItem('wideToken'),
      searchMusic.value,
    );
    const { response, json } = await request(url, options);
    if (response.ok) {
      setTracks(json.tracks.items);
    }
  }

  async function handleSubmitTrack(event, track) {
    event.preventDefault();
    const trackUri = track.uri;
    const { url, options } = ADD_TRACK_TO_PLAYLIST(
      window.localStorage.getItem('wideToken'),
      playlistIdUsing,
      trackUri,
    );
    const { response } = await request(url, options);
    if (response.ok) {
      setModalAddTrack(!modalAddTrack);
      setPlaylists((old) =>
        old.map((playlist) =>
          playlist.id === playlistIdUsing
            ? {
                ...playlist,
                myMusics: [...playlist.myMusics, { track: track }],
              }
            : { ...playlist },
        ),
      );
    }
  }

  async function handleOpenModal(event, playlistId) {
    event.preventDefault();
    setModalAddTrack(!modalAddTrack);
    setPlaylistIdUsing(playlistId);
  }

  async function handleDeleteTrackFromPlaylist(
    event,
    playlistId,
    trackUri,
    index,
  ) {
    event.preventDefault();
    console.log('oi');
    const { url, options } = DELETE_TRACK_FROM_PLAYLIST(
      window.localStorage.getItem('wideToken'),
      playlistId,
      trackUri,
    );

    const { response, json } = await request(url, options);
    if (response.ok) {
      const newMusicsArray = playlists[index].myMusics.filter(
        (music) => music.track.uri !== trackUri,
      );
      setPlaylists((old) =>
        old.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, myMusics: newMusicsArray }
            : { ...playlist },
        ),
      );
    }
  }

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code && !window.localStorage.getItem('wideRefreshToken')) {
      requestToken(code);
    } else {
      requestUserProfileAndPlaylists();
    }
  }, []);

  const link_authorize = REQUEST_CODE_AUTHORIZATION();

  if (error) return <p>Error: {error}</p>;
  if (loading) return <p>Carregando...</p>;
  if (data)
    return (
      <>
        {userId && (
          <>
            <p>{userId}</p>
          </>
        )}
        {window.localStorage.getItem('wideToken') ? (
          <p>Acessou</p>
        ) : (
          <a href={link_authorize}>Conectar</a>
        )}
        {console.log(playlists)}
        {playlists && (
          <>
            <h3>Playlists</h3>
            {playlists.map((playlist, index) => (
              <div key={index} id={playlist.id} className="palylist-area">
                <div className="image-title-playlist">
                  {playlist.images.length > 0 && (
                    <img
                      className="image-album"
                      src={playlist.images[0].url}
                      alt={`playlist ${playlist.name}`}
                    />
                  )}
                  <p>{playlist.name}</p>
                </div>
                <ul>
                  {playlist.myMusics.map(({ track }) => (
                    <li key={track.id} className="track-line">
                      <p>{track.name + ' - ' + track.artists[0].name}</p>
                      <button
                        type="button"
                        onClick={(event) =>
                          handleDeleteTrackFromPlaylist(
                            event,
                            playlist.id,
                            track.uri,
                            index,
                          )
                        }
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={(event) => handleOpenModal(event, playlist.id)}
                >
                  + Adicionar música
                </button>
              </div>
            ))}
          </>
        )}

        {modalAddTrack && (
          <div className={`search-music-area ${modalAddTrack}`}>
            <button
              className="close-modal"
              onClick={() => setModalAddTrack(!modalAddTrack)}
            >
              Fechar
            </button>
            <h3>Buscar Música</h3>
            <form onSubmit={handleSubmitSearch}>
              <Input
                label="Buscar Música"
                type="text"
                name="search"
                {...searchMusic}
              />
              <button>Buscar</button>
            </form>

            <ul>
              {tracks &&
                tracks.map((track, index) => (
                  <li key={index} className="track-line">
                    <p>{track.name + ' - ' + track.artists[0].name}</p>
                    <button
                      type="button"
                      onClick={(event) => handleSubmitTrack(event, track)}
                    >
                      Adicionar
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </>
    );
  else return null;
};

export default App;
