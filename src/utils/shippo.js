import shippo from "shippo"

class Shippo {
  constructor(token) {
    this.client_ = shippo(token)

    this.retrieveFulfillmentOptions = this.composeFulfillmentOptions_()
    this.createOrder = this.createOrder_
  }

  async composeFulfillmentOptions_() {
    const shippingOptions = await this.fetchCarriers_().then((carriers) =>
      this.findActiveCarriers_(carriers).then((activeCarriers) =>
        this.splitCarriersToServices_(activeCarriers)
      )
    )

    const shippingOptionGroups = await this.fetchServiceGroups_().then(
      (groups) =>
        groups.map((serviceGroup) => ({
          id: `shippo-fulfillment-${serviceGroup.object_id}`,
          is_group: true,
          ...serviceGroup,
        }))
    )

    return [...shippingOptions, ...shippingOptionGroups]
  }

  async fetchCarriers_() {
    return await this.client_.carrieraccount
      .list({ service_levels: true, results: 100 })
      .then((response) => response.results)
  }

  async fetchServiceGroups_() {
    return await this.client_.servicegroups.list()
  }

  async fetchCarrierParcelTemplate(token) {
    return []
  }

  async fetchCustomParcelTemplates() {
    return await this.client_.userparceltemplates
      .list()
      .then((response) => response.results)
  }

  async fetchCustomParcel(id) {
    return await this.client_.userparceltemplates.retrieve(id)
  }

  async fetchPackingSlip(orderId) {
    return await this.client_.order.packingslip(orderId)
  }

  async fetchOrder(id) {
    return await this.client_.order.retrieve(id)
  }

  async fetchLiveRates(toAddress, lineItems, shippingOptions, parcel) {
    return await this.client_.liverates
      .create({
        address_to: toAddress,
        line_items: lineItems,
        parcel: parcel,
      })
      .then((response) =>
        response.results.filter((item) =>
          shippingOptions.find(
            (option) => option.data.name === item.title && true
          )
        )
      )
  }

  async findActiveCarriers_(carriers) {
    return carriers.filter((carrier) => carrier.active)
  }

  async splitCarriersToServices_(carriers) {
    return carriers.flatMap((carrier) =>
      carrier.service_levels.map((service_type) => {
        const { service_levels, ...service } = {
          ...service_type,
          id: `shippo-fulfillment-${service_type.token}`,
          name: `${carrier.carrier_name} ${service_type.name}`,
          carrier_id: carrier.object_id,
          is_group: false,
          ...carrier,
        }
        return service
      })
    )
  }

  async createOrder_(order) {
    return await this.client_.order.create(order)
  }
}

export default Shippo
