import { carrierAccountStub } from "./shippo/carrier"
import { shippoOrderStub } from "./shippo/order"
import {
  shippoTransactionStub,
  shippoTransactionExtendedStub,
} from "./shippo/transaction"
import { liveRateStub } from "./shippo/live-rate"
import { userParcelStub } from "./shippo/user-parcel"
import { serviceGroupStub } from "./shippo/service-group"

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
      results: state.carriers().map((carrier) => carrierAccountStub(carrier)),
    })),
    retrieve: jest.fn(async (id) => ({
      carrier: "usps",
    })),
  },
  liverates: {
    create: jest.fn(async () => ({
      results: state.live_rate.map((rate) => liveRateStub(rate)),
    })),
  },
  order: {
    create: jest.fn(async () =>
      shippoOrderStub(state.order("shippo_order_no_transactions"), {})
    ),
    retrieve: jest.fn(async (object_id) =>
      shippoOrderStub(state.order(object_id, {}))
    ),

    packingslip: jest.fn(async () => ({
      expires: "",
      slip_url: "https://shippo-delivery.net",
      created: "",
    })),
  },
  servicegroups: {
    list: jest.fn(async () =>
      state.service_groups.map((sg) => serviceGroupStub(sg))
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
      shippoTransactionStub(state.transaction(object_id))
    ),

    search: jest.fn(async (q) => ({
      results: state.transaction(q.replace(/[^0-9]/g, ""))
        ? state
            .transaction(q.replace(/[^0-9]/g, ""))
            .map((ta) => shippoTransactionExtendedStub(ta))
        : [],
    })),
  },
  userparceltemplates: {
    list: jest.fn(async () => ({
      results: state.user_parcels().map((parcel) => userParcelStub(parcel)),
    })),
  },
})
