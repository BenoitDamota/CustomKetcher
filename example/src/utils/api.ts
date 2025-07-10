export const apiUrl =
  process.env.REACT_APP_INTERN_API_PATH ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)._env_?.EXTERNAL_ENV_API_PATH ||
  '';
