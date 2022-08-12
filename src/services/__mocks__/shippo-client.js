import { carrierAccountMock } from "./shippo/carrier"
import { shippoOrderMock } from "./shippo/order"
import {
  shippoTransactionMock,
  shippoTransactionExtendedMock,
} from "./shippo/transaction"
import { liveRateMock } from "./shippo/live-rate"
import { userParcelMock } from "./shippo/user-parcel"
import { serviceGroupMock } from "./shippo/service-group"

export const shippoClientMock = (state) => ({
  account: {
    address: jest.fn(async () => ({
      results: [
        {
          is_default_sender: true,
          is_default_return: true,
        },
        {
          is_default_sender: false,
          is_default_return: false,
        },
      ],
    })),
  },
  carrieraccount: {
    list: jest.fn(async () => ({
      results: state.carriers.map((carrier) => carrierAccountMock(carrier)),
    })),
    retrieve: jest.fn(async (id) => ({
      carrier: "usps",
    })),
  },
  liverates: {
    create: jest.fn(async () => ({
      results: state.live_rate.map((rate) => liveRateMock(rate)),
    })),
  },
  order: {
    create: jest.fn(async () =>
      shippoOrderMock(state.order("shippo_order_no_transactions"), {})
    ),
    retrieve: jest.fn(async (object_id) =>
      // console.log("order", object_id)
      shippoOrderMock(state.order(object_id, {}))
    ),

    packingslip: jest.fn(async () => ({
      expires: "",
      slip_url: "https://shippo-delivery.net",
      created: "",
    })),
  },
  servicegroups: {
    list: jest.fn(async () =>
      state.service_groups.map((sg) => serviceGroupMock(sg))
    ),
  },
  track: {
    get_status: jest.fn(async (carrier, tracking_number) => ({
      tracking_number,
      carrier,
    })),
  },
  transaction: {
    retrieve: jest.fn(async (object_id) =>
      shippoTransactionMock(state.transaction(object_id))
    ),

    search: jest.fn(async (q) => ({
      results: state
        .transaction(q.replace(/[^0-9]/g, ""))
        .map((ta) => shippoTransactionExtendedMock(ta)),
    })),
  },
  userparceltemplates: {
    list: jest.fn(async () => ({
      results: state.user_parcels.map((parcel) => userParcelMock(parcel)),
    })),
  },
})
