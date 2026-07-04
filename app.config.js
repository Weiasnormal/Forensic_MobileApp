export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_AVERA_API_BASE_URL,
    },
  };
};