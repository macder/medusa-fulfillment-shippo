import { lineItemTotalsSchema } from "./schema"

export const totalsServiceMock = () => ({
  getLineItemTotals: jest.fn(async () => lineItemTotalsSchema()),
})
