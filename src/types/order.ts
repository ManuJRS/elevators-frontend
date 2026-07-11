export interface CustomerOrderLineItemProduct {
  name: string | null;
  sku: string | null;
}

export interface CustomerOrderLineItemNode {
  databaseId: number;
  product: {
    node: CustomerOrderLineItemProduct | null;
  } | null;
  quantity: number | null;
  total: string | null;
}

export interface CustomerOrderNode {
  databaseId: number;
  date: string | null;
  status: string | null;
  total: string | null;
  paymentMethodTitle: string | null;
  lineItems: {
    nodes: CustomerOrderLineItemNode[];
  } | null;
}

export interface GetCustomerOrdersResponse {
  customer: {
    orders: {
      nodes: CustomerOrderNode[];
    } | null;
  } | null;
}
