import { claimSchema } from "../claim"
import { returnSchema } from "./schema"

export const returnMock = ({ ...state }) =>
  returnSchema({
    ...state,
    claim_order: state?.claim_order
      ? claimSchema({ ...state.claim_order })
      : null,
  })
