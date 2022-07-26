export const getConfigFile = () => ({
  configModule: {
    projectConfig: {
      redis_url: "REDIS_URL",
      database_url: "DATABASE_URL",
      database_type: "postgres",
      store_cors: "STORE_CORS",
      admin_cors: "ADMIN_CORS",
      store_address: "SHIPPO_DEFAULT_SENDER_ADDRESS_ID",
      api_key: "11111111",
      weight_unit_type: "g",
      dimension_unit_type: "cm",
    },
    plugins: [],
  },
})

export const humanizeAmount = (price) => parseFloat(parseInt(price, 10) / 100)

export const MedusaErrorTypes = {
  /** Errors stemming from the database */
  DB_ERROR: "database_error",
  DUPLICATE_ERROR: "duplicate_error",
  INVALID_ARGUMENT: "invalid_argument",
  INVALID_DATA: "invalid_data",
  NOT_FOUND: "not_found",
  NOT_ALLOWED: "not_allowed",
  UNEXPECTED_STATE: "unexpected_state",
}

export const MedusaErrorCodes = {
  INSUFFICIENT_INVENTORY: "insufficient_inventory",
  CART_INCOMPATIBLE_STATE: "cart_incompatible_state",
}

export class MedusaError extends Error {
  static Types = MedusaErrorTypes

  static Codes = MedusaErrorCodes

  constructor(type, message, code = "null", ...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MedusaError)
    }
    this.type = type
    this.code = code
    this.message = message
    this.date = new Date()
  }
}
