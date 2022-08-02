import { fulfillOptionTemplate, shippingOptionTemplate } from "./templates"

export const shippingProfileServiceMock = (config) => {
  const shippingOptionProps = (id = null) =>
    config(({ shipping_options }) => {
      const shipping_option = shipping_options.find((so) => (so.id = id))
      const optionType = shipping_option.data?.type ? "group" : "service"

      return {
        ...shipping_option,
        data: fulfillOptionTemplate(optionType)(shipping_option.data),
      }
    })

  return {
    fetchCartOptions: jest.fn(() =>
      config(({ shipping_options }) => shipping_options).map((so) =>
        shippingOptionTemplate(shippingOptionProps(so.id))
      )
    ),

    retrieve: jest.fn((id) => shippingOptionTemplate(shippingOptionProps(id))),
  }
}
