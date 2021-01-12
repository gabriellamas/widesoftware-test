import React, { useEffect, useState, useCallback } from 'react';
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
  CREATE_PLAYLIST,
  DELETE_PLAYLIST,
  GET_WEATHER,
} from './Api.js';
import useFetch from './Hooks/useFetch';
import useForm from './Hooks/useForm';
import Input from './Components/Forms/Input';
import './App.css';

const App = () => {
  const { data, error, loading, request, setData } = useFetch();
  const searchMusic = useForm();
  const createPlaylist = useForm();
  const weatherInput = useForm();
  const weatherInputPlaylist = useForm();
  const [userId, setUserId] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [playlistIdUsing, setPlaylistIdUsing] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [modalAddTrack, setModalAddTrack] = useState(false);
  const [modalAddWeather, setModalAddWeather] = useState(false);
  const [modalAddPlaylist, setModalAddPlaylist] = useState(false);
  const [code, setCode] = useState(null);
  const [coords, setCoords] = useState(() => {
    if (window.localStorage.getItem('coords')) {
      return JSON.parse(window.localStorage.getItem('coords'));
    }
    return null;
  });
  const [weathers, setWeathers] = useState(() => {
    if (window.localStorage.getItem('weathers')) {
      return JSON.parse(window.localStorage.getItem('weathers'));
    }
    return {
      myWeather: undefined,
      weathers: [],
    };
  });

  const requestUserPlaylists = useCallback(async () => {
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
  }, [request]);

  const requestToken = useCallback(
    async (code) => {
      const { url, options } = REQUEST_TOKEN(code);
      const { response, json } = await request(url, options);
      if (response.ok) {
        window.localStorage.setItem('wideToken', json.access_token);
        window.localStorage.setItem('wideRefreshToken', json.refresh_token);
        return true;
      } else {
        return false;
      }
    },
    [request],
  );

  const requestUserProfileAndPlaylists = useCallback(async () => {
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
      } else {
        console.log('error', error);
      }
    }
  }, [requestUserPlaylists, request, error]);

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

  function handleOpenModal(event, playlistId) {
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
    } else {
      console.log('error', response, json);
    }
  }

  async function handleCreatePlaylist(event) {
    event.preventDefault();
    const { url, options } = CREATE_PLAYLIST(
      window.localStorage.getItem('wideToken'),
      userId,
      createPlaylist.value,
    );
    const { response, json } = await request(url, options);
    if (response.ok) {
      setWeathers((old) => ({
        ...old,
        weathers: [
          ...old.weathers,
          { id: json.id, weather: weatherInput.value },
        ],
      }));
      setPlaylists((old) => [
        ...old,
        {
          ...json,
          myMusics: [],
          weather: weatherInput.value,
        },
      ]);
      setModalAddPlaylist(false);
    } else {
      console.log('error', error);
    }
  }

  async function handleDeletePlaylist(event, playlistId) {
    event.preventDefault();

    const { url, options } = DELETE_PLAYLIST(
      window.localStorage.getItem('wideToken'),
      playlistId,
    );
    const response = await fetch(url, options);

    if (response.ok) {
      setPlaylists((oldPLaylists) =>
        oldPLaylists.filter((playlist) => playlist.id !== playlistId),
      );
      setWeathers((oldWeathers) => ({
        ...oldWeathers,
        weathers: oldWeathers.weathers.filter(
          (weather) => weather.id !== playlistId,
        ),
      }));
    } else {
      console.log('error', error);
    }
  }

  async function requestCoords() {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
      return;
    } else {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          window.localStorage.setItem(
            'coords',
            JSON.stringify({ lat: lat, long: long }),
          );
          setCoords({ lat: lat, long: long });
        },
        (responseError) => {
          console.log('erro', responseError);
        },
      );
    }
  }

  function handleLogout(event) {
    event.preventDefault();
    window.history.pushState({}, 'widesoftware', '/');
    window.localStorage.removeItem('wideToken');
    window.localStorage.removeItem('wideRefreshToken');
    window.localStorage.removeItem('coords');
    setData(null);
    setCoords(null);
    setCode(null);
    setWeathers({ weathers: [] });
  }

  const getWeather = useCallback(async () => {
    const { url, options } = GET_WEATHER(
      window.localStorage.getItem('wideToken'),
      coords.lat,
      coords.long,
    );
    console.log('url options', url, options);
  }, [coords]);

  const requestWeather = useCallback(async () => {
    const { url, options } = GET_WEATHER(coords.lat, coords.long);
    const { response, json } = await request(url, options);
    if (response.ok) {
      setWeathers((old) => ({
        myWeather: Math.round(json.main.temp).toString(),
        weathers: [...old.weathers],
      }));
    }
  }, [coords, request]);

  function handleModalAddWeather(event, playlistId) {
    event.preventDefault();
    setModalAddWeather(true);
    setPlaylistIdUsing(playlistId);
  }

  function handleAddWeather() {
    setWeathers((old) => ({
      ...old,
      weathers: [
        ...old.weathers,
        { id: playlistIdUsing, weather: weatherInputPlaylist.value },
      ],
    }));
    setPlaylistIdUsing(null);
    setModalAddWeather(false);
  }

  useEffect(() => {
    localStorage.setItem('weathers', JSON.stringify(weathers));
    const params = new URLSearchParams(window.location.search);
    setCode(params.get('code'));

    if (code && !window.localStorage.getItem('wideToken') && coords) {
      requestToken(code).then(async () => {
        requestUserProfileAndPlaylists();
        requestWeather();
      });
    } else if (window.localStorage.getItem('wideToken')) {
      requestUserProfileAndPlaylists();
    }
  }, [
    requestToken,
    requestUserProfileAndPlaylists,
    coords,
    code,
    request,
    getWeather,
    weathers,
    requestWeather,
  ]);

  if (error) return <p>Erro: {error}</p>;
  if (loading) return <p>Carregando...</p>;
  if (data)
    return (
      <>
        {window.localStorage.getItem('wideToken') && (
          <div className="flex-area">
            <p>{userId}</p>
            <button onClick={handleLogout}>Sair</button>
          </div>
        )}
        {playlists && (
          <>
            <p>Temperatura atual {weathers.myWeather} °C</p>
            <h3>Playlists</h3>
            <div className="container-playlists">
              {playlists.map((playlist, index) =>
                weathers.weathers.filter(
                  (weather) => weather.id === playlist.id,
                ).length === 0 ? (
                  <div key={index} id={playlist.id} className={`palylist-area`}>
                    <button
                      key={playlist.id}
                      onClick={(event) =>
                        handleModalAddWeather(event, playlist.id)
                      }
                      className="btn-associar-temperatura"
                    >
                      Associar temperatura
                    </button>
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

                    <div className="flex-area">
                      <button
                        type="button"
                        onClick={(event) => handleOpenModal(event, playlist.id)}
                      >
                        + Adicionar música
                      </button>

                      <button
                        type="button"
                        onClick={(event) =>
                          handleDeletePlaylist(event, playlist.id)
                        }
                      >
                        Remover playlist
                      </button>
                    </div>
                  </div>
                ) : (
                  weathers.weathers
                    .filter((weather) => weather.id === playlist.id)
                    .map((weatherFinal) => (
                      <div
                        key={index}
                        id={playlist.id}
                        className={`palylist-area ${
                          weatherFinal.weather === weathers.myWeather
                            ? 'top'
                            : ''
                        }`}
                      >
                        <p
                          key={playlist.id}
                          className="btn-associar-temperatura"
                        >
                          {weatherFinal.weather} °C
                        </p>
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
                              <p>
                                {track.name + ' - ' + track.artists[0].name}
                              </p>
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

                        <div className="flex-area">
                          <button
                            type="button"
                            onClick={(event) =>
                              handleOpenModal(event, playlist.id)
                            }
                          >
                            + Adicionar música
                          </button>

                          <button
                            type="button"
                            onClick={(event) =>
                              handleDeletePlaylist(event, playlist.id)
                            }
                          >
                            Remover playlist
                          </button>
                        </div>
                      </div>
                    ))
                ),
              )}
            </div>
          </>
        )}
        {data && (
          <button
            type="button"
            onClick={() => setModalAddPlaylist(true)}
            style={{ marginTop: '32px' }}
          >
            + Criar nova playlist
          </button>
        )}
        {modalAddWeather && (
          <div className={`add-playlist-area animation-left`}>
            <button
              className="close-modal"
              onClick={() => setModalAddPlaylist(false)}
            >
              Fechar
            </button>
            <h3>Associar temperatura</h3>
            <form onSubmit={handleAddWeather}>
              <Input
                label="Temperatura associada"
                type="text"
                name="weather"
                {...weatherInputPlaylist}
              />
              <button>Associar</button>
            </form>
          </div>
        )}
        {modalAddPlaylist && (
          <div className={`add-playlist-area animation-left`}>
            <button
              className="close-modal"
              onClick={() => setModalAddPlaylist(false)}
            >
              Fechar
            </button>
            <h3>Criar nova playlist</h3>
            <form onSubmit={handleCreatePlaylist}>
              <Input
                label="Nome da playlist"
                type="text"
                name="playlist-name"
                {...createPlaylist}
              />
              <Input
                label="Temperatura associada"
                type="text"
                name="weather"
                {...weatherInput}
              />
              <button>Criar</button>
            </form>
          </div>
        )}
        {modalAddTrack && (
          <div className={`search-music-area animation-left ${modalAddTrack}`}>
            <button
              className="close-modal"
              onClick={() => setModalAddTrack(!modalAddTrack)}
            >
              Fechar
            </button>
            <h3>Adicionar música</h3>
            <form onSubmit={handleSubmitSearch}>
              <Input
                label="Nome da música"
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
  else
    return (
      <>
        <h2>
          Crie playlists e associe a uma temperatura, sempre que estiver no
          clima escolhido, indicaremos a sua playlist
        </h2>
        <p>
          Para utilizar nosso app você precisa conectar sua conta spotify e
          permitir o acesso da sua localização para pegarmos a temperatura
        </p>
        <div className="flex-area column-direction">
          {!code ? (
            <a href={REQUEST_CODE_AUTHORIZATION()}>1: conectar com spotify</a>
          ) : (
            <p style={{ color: 'green' }}>Spotify conectado</p>
          )}
          {!code ? (
            <button disabled onClick={requestCoords}>
              2: Permitir acesso a minha localização
            </button>
          ) : (
            <button onClick={requestCoords}>
              2: Permitir acesso a minha localização
            </button>
          )}
        </div>
      </>
    );
};

export default App;
