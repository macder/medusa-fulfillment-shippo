import { BaseService } from "medusa-interfaces"

class ShippoTrackService extends BaseService {
  #client
  #shippo
  #shippoTransactionService

  constructor({ shippoClientService, shippoTransactionService }, options) {
    super()

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransactionService = shippoTransactionService

    this.#client = this.#shippo.useClient
  }

  async fetch() {

  }

  async registerHook() {

  }

  async addMetaData() {
    
  }
}

export default ShippoTrackService
