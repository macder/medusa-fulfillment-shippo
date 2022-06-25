export const getConfigFile = () => ({
  configModule: {
    projectConfig: {
      redis_url: 'REDIS_URL',
      database_url: 'DATABASE_URL',
      database_type: "postgres",
      store_cors: 'STORE_CORS',
      admin_cors: 'ADMIN_CORS',
      store_address: 'SHIPPO_DEFAULT_SENDER_ADDRESS_ID',
      api_key: '11111111',
      weight_unit_type: 'g',
      dimension_unit_type: 'cm'
    },
    plugins: []
  }
})

export const humanizeAmount = (price, currency) => parseFloat(parseInt(price) / 100)
