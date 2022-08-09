import { shippoOrderMock } from "./shippo/order"
import {
  shippoTransactionMock,
  shippoTransactionExtendedMock,
} from "./shippo/transaction"
import { userParcelMock } from "./shippo/user-parcel"

export const shippoClientMock = ({ ...state }) => ({
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
    list: jest.fn(async () => []),
    retrieve: jest.fn(async (id) => ({
      carrier: "usps",
    })),
  },
  order: {
    retrieve: jest.fn(async (object_id) =>
      shippoOrderMock(state.order)(object_id)
    ),

    packingslip: jest.fn(async () => ({
      expires: "",
      slip_url: "https://shippo-delivery.net",
      created: "",
    })),
  },
  track: {
    get_status: jest.fn(async (carrier, tracking_number) => ({
      tracking_number,
      carrier,
    })),
  },
  transaction: {
    retrieve: jest.fn(async (object_id) =>
      shippoTransactionMock(state?.transaction?.label)(object_id)
    ),

    search: jest.fn(async (q) => ({
      results: state.order.transactions.map((ta) =>
        shippoTransactionExtendedMock(
          ta.object_id === "ta_label"
            ? state.transaction.label
            : state.transaction.return
        )(ta.object_id)
      ),
    })),
  },
  userparceltemplates: {
    list: jest.fn(async () => ({
      results: state.user_parcels.map((parcel) => userParcelMock(parcel)),
    })),
  },
})
