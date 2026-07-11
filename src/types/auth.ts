export interface UserState {
  token: string | null;
  userEmail: string | null;
  displayName: string | null;
  customerId: string | null;
  isAuthenticated: boolean;
}

export interface GraphQLErrorItem {
  message: string;
}

export interface LoginUserResponse {
  login: {
    authToken: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export interface RegisterCorporateInput {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  company?: string;
  address1: string;
  city: string;
  postcode: string;
}

export interface CustomerDetailsInput {
  phone: string;
  company?: string;
  address1: string;
  city: string;
  postcode: string;
}

export interface CustomerDetailsState {
  phone: string;
  company: string;
  address1: string;
  city: string;
  postcode: string;
}

export interface CustomerAddressSnapshot {
  phone: string | null;
  company: string | null;
}

export interface CustomerShippingSnapshot {
  address1: string | null;
  city: string | null;
  postcode: string | null;
}

export interface RegisterCustomerResponse {
  registerCustomer: {
    customer: {
      id: string;
    } | null;
  } | null;
}

export interface GraphQLLoginEnvelope {
  data?: LoginUserResponse;
  errors?: GraphQLErrorItem[];
}

export interface GraphQLRegisterEnvelope {
  data?: RegisterCustomerResponse;
  errors?: GraphQLErrorItem[];
}

export interface SendPasswordResetResponse {
  sendPasswordResetEmail: {
    user: {
      email: string;
    } | null;
  } | null;
}

export interface ResetUserPasswordResponse {
  resetUserPassword: {
    user: {
      username: string;
    } | null;
  } | null;
}

export interface GraphQLSendPasswordResetEnvelope {
  data?: SendPasswordResetResponse;
  errors?: GraphQLErrorItem[];
}

export interface GraphQLResetUserPasswordEnvelope {
  data?: ResetUserPasswordResponse;
  errors?: GraphQLErrorItem[];
}

export interface UpdateCustomerResponse {
  updateCustomer: {
    customer: {
      billing: {
        phone: string | null;
        company: string | null;
      } | null;
      shipping: {
        address1: string | null;
        city: string | null;
        postcode: string | null;
      } | null;
    } | null;
  } | null;
}

export interface ViewerIdResponse {
  viewer: {
    id: string;
  } | null;
}

export interface GraphQLUpdateCustomerEnvelope {
  data?: UpdateCustomerResponse;
  errors?: GraphQLErrorItem[];
}

export interface GraphQLViewerIdEnvelope {
  data?: ViewerIdResponse;
  errors?: GraphQLErrorItem[];
}

export interface CustomerDetailsQueryResponse {
  customer: {
    id: string;
    billing: CustomerAddressSnapshot | null;
    shipping: CustomerShippingSnapshot | null;
  } | null;
}

export interface GraphQLCustomerDetailsEnvelope {
  data?: CustomerDetailsQueryResponse;
  errors?: GraphQLErrorItem[];
}

export interface UpdateUserPasswordResponse {
  updateUser: {
    user: {
      databaseId: number | null;
    } | null;
  } | null;
}

export interface GraphQLUpdateUserPasswordEnvelope {
  data?: UpdateUserPasswordResponse;
  errors?: GraphQLErrorItem[];
}
