import { ref } from 'vue';
import { defineStore } from 'pinia';
import { syncGraphQLAuthHeaders } from '../api/client';
import type {
  CustomerAddressSnapshot,
  CustomerDetailsInput,
  CustomerDetailsState,
  CustomerShippingSnapshot,
  GraphQLCustomerDetailsEnvelope,
  GraphQLLoginEnvelope,
  GraphQLRegisterEnvelope,
  GraphQLResetUserPasswordEnvelope,
  GraphQLSendPasswordResetEnvelope,
  GraphQLUpdateCustomerEnvelope,
  GraphQLUpdateUserPasswordEnvelope,
  GraphQLViewerIdEnvelope,
  RegisterCorporateInput,
  UpdateCustomerResponse,
  UserState,
} from '../types/auth';

const GRAPHQL_ENDPOINT =
  (import.meta.env.VITE_GRAPHQL_URL as string) || 'http://localhost:8080/graphql';

const STORAGE_KEYS = {
  token: 'auth_token',
  userEmail: 'user_email',
  displayName: 'display_name',
  customerId: 'customer_id',
  isAuthenticated: 'is_authenticated',
} as const;

const LOGIN_MUTATION = `
  mutation LoginUser($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      user {
        id
        email
        name
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation RegisterCustomerAdvanced(
    $username: String!
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $phone: String!
    $company: String
    $address1: String!
    $city: String!
    $postcode: String!
  ) {
    registerCustomer(
      input: {
        username: $username
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
        billing: {
          firstName: $firstName
          lastName: $lastName
          phone: $phone
          company: $company
          email: $email
          country: MX
        }
        shipping: {
          firstName: $firstName
          lastName: $lastName
          address1: $address1
          city: $city
          postcode: $postcode
          country: MX
        }
      }
    ) {
      customer {
        id
      }
    }
  }
`;

const SEND_PASSWORD_RESET_MUTATION = `
  mutation SendPasswordReset($username: String!) {
    sendPasswordResetEmail(input: { username: $username }) {
      user {
        email
      }
    }
  }
`;

const RESET_USER_PASSWORD_MUTATION = `
  mutation ResetPassword($key: String!, $login: String!, $password: String!) {
    resetUserPassword(input: { key: $key, login: $login, password: $password }) {
      user {
        username
      }
    }
  }
`;

const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomerAdvanced(
    $id: ID!
    $phone: String!
    $company: String
    $address1: String!
    $city: String!
    $postcode: String!
  ) {
    updateCustomer(
      input: {
        id: $id
        billing: {
          phone: $phone
          company: $company
        }
        shipping: {
          address1: $address1
          city: $city
          postcode: $postcode
        }
      }
    ) {
      customer {
        billing {
          phone
          company
        }
        shipping {
          address1
          city
          postcode
        }
      }
    }
  }
`;

const CHANGE_USER_PASSWORD_MUTATION = `
  mutation ChangeUserPassword($id: ID!, $password: String!) {
    updateUser(input: { id: $id, password: $password }) {
      user {
        databaseId
      }
    }
  }
`;

const VIEWER_ID_QUERY = `
  query ViewerId {
    viewer {
      id
    }
  }
`;

const CUSTOMER_DETAILS_QUERY = `
  query CustomerDetails {
    customer {
      id
      billing {
        phone
        company
      }
      shipping {
        address1
        city
        postcode
      }
    }
  }
`;

const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

const parseGraphQLError = (message: string | undefined, fallback: string): string => {
  if (!message) {
    return fallback;
  }

  return stripHtml(message) || fallback;
};

const executeGraphQL = async <T>(
  query: string,
  variables: Record<string, string | null | undefined>,
): Promise<T> => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('No se pudo conectar con el servidor GraphQL.');
  }

  return (await response.json()) as T;
};

const executeAuthenticatedGraphQL = async <T>(
  query: string,
  variables: Record<string, string | null | undefined>,
  authToken: string,
): Promise<T> => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('No se pudo conectar con el servidor GraphQL.');
  }

  return (await response.json()) as T;
};

const loadStateFromStorage = (): UserState => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const userEmail = localStorage.getItem(STORAGE_KEYS.userEmail);
  const displayName = localStorage.getItem(STORAGE_KEYS.displayName);
  const customerId = localStorage.getItem(STORAGE_KEYS.customerId);
  const storedAuthFlag = localStorage.getItem(STORAGE_KEYS.isAuthenticated) === 'true';

  return {
    token,
    userEmail,
    displayName,
    customerId,
    isAuthenticated: storedAuthFlag && Boolean(token),
  };
};

const persistState = (state: UserState): void => {
  if (state.token) {
    localStorage.setItem(STORAGE_KEYS.token, state.token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  if (state.userEmail) {
    localStorage.setItem(STORAGE_KEYS.userEmail, state.userEmail);
  } else {
    localStorage.removeItem(STORAGE_KEYS.userEmail);
  }

  if (state.displayName) {
    localStorage.setItem(STORAGE_KEYS.displayName, state.displayName);
  } else {
    localStorage.removeItem(STORAGE_KEYS.displayName);
  }

  if (state.customerId) {
    localStorage.setItem(STORAGE_KEYS.customerId, state.customerId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.customerId);
  }

  localStorage.setItem(STORAGE_KEYS.isAuthenticated, String(state.isAuthenticated));
};

const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.userEmail);
  localStorage.removeItem(STORAGE_KEYS.displayName);
  localStorage.removeItem(STORAGE_KEYS.customerId);
  localStorage.removeItem(STORAGE_KEYS.isAuthenticated);
};

export const useAuthStore = defineStore('auth', () => {
  const initialState = loadStateFromStorage();

  const token = ref<string | null>(initialState.token);
  const userEmail = ref<string | null>(initialState.userEmail);
  const displayName = ref<string | null>(initialState.displayName);
  const customerId = ref<string | null>(initialState.customerId);
  const customerDetails = ref<CustomerDetailsState | null>(null);
  const isAuthenticated = ref<boolean>(initialState.isAuthenticated);
  const isUpdatingCustomer = ref<boolean>(false);
  const isLoadingCustomerDetails = ref<boolean>(false);
  const isChangingPassword = ref<boolean>(false);

  syncGraphQLAuthHeaders(isAuthenticated.value ? token.value : null);

  const applySession = (nextState: UserState): void => {
    token.value = nextState.token;
    userEmail.value = nextState.userEmail;
    displayName.value = nextState.displayName;
    customerId.value = nextState.customerId;
    isAuthenticated.value = nextState.isAuthenticated;

    persistState(nextState);
    syncGraphQLAuthHeaders(nextState.token);
  };

  const setCustomerId = (nextCustomerId: string | null): void => {
    customerId.value = nextCustomerId;

    if (nextCustomerId) {
      localStorage.setItem(STORAGE_KEYS.customerId, nextCustomerId);
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.customerId);
  };

  const mapCustomerDetailsFromResponse = (
    billing: CustomerAddressSnapshot | null | undefined,
    shipping: CustomerShippingSnapshot | null | undefined,
  ): CustomerDetailsState => ({
    phone: billing?.phone?.trim() ?? '',
    company: billing?.company?.trim() ?? '',
    address1: shipping?.address1?.trim() ?? '',
    city: shipping?.city?.trim() ?? '',
    postcode: shipping?.postcode?.trim() ?? '',
  });

  async function resolveCustomerId(authToken: string): Promise<string> {
    if (customerId.value) {
      return customerId.value;
    }

    const payload = await executeAuthenticatedGraphQL<GraphQLViewerIdEnvelope>(
      VIEWER_ID_QUERY,
      {},
      authToken,
    );

    if (payload.errors?.length) {
      throw new Error(
        parseGraphQLError(payload.errors[0]?.message, 'No se pudo identificar al cliente autenticado.'),
      );
    }

    const viewerId = payload.data?.viewer?.id;

    if (!viewerId) {
      throw new Error('No se encontró el identificador del cliente autenticado.');
    }

    setCustomerId(viewerId);
    return viewerId;
  }

  async function fetchCustomerDetails(): Promise<CustomerDetailsState> {
    if (!isAuthenticated.value || !token.value) {
      throw new Error('Debes iniciar sesión para consultar tu información corporativa.');
    }

    isLoadingCustomerDetails.value = true;

    try {
      const payload = await executeAuthenticatedGraphQL<GraphQLCustomerDetailsEnvelope>(
        CUSTOMER_DETAILS_QUERY,
        {},
        token.value,
      );

      if (payload.errors?.length) {
        throw new Error(
          parseGraphQLError(payload.errors[0]?.message, 'No se pudieron cargar los datos del cliente.'),
        );
      }

      const customer = payload.data?.customer;

      if (!customer?.billing || !customer.shipping) {
        throw new Error('El servidor no devolvió la información corporativa del cliente.');
      }

      if (customer.id) {
        setCustomerId(customer.id);
      }

      const details = mapCustomerDetailsFromResponse(customer.billing, customer.shipping);
      customerDetails.value = details;

      return details;
    } finally {
      isLoadingCustomerDetails.value = false;
    }
  }

  function hydrate(): void {
    applySession(loadStateFromStorage());
  }

  async function login(username: string, password: string): Promise<void> {
    const payload = await executeGraphQL<GraphQLLoginEnvelope>(LOGIN_MUTATION, {
      username: username.trim(),
      password,
    });

    if (payload.errors?.length) {
      throw new Error(parseGraphQLError(payload.errors[0]?.message, 'Credenciales inválidas.'));
    }

    const authToken = payload.data?.login?.authToken;
    const user = payload.data?.login?.user;

    if (!authToken || !user) {
      throw new Error('La respuesta de autenticación no contiene un token válido.');
    }

    applySession({
      token: authToken,
      userEmail: user.email,
      displayName: user.name || user.email,
      customerId: user.id,
      isAuthenticated: true,
    });
  }

  async function register(input: RegisterCorporateInput): Promise<void> {
    const trimmedUsername = input.username.trim();
    const trimmedEmail = input.email.trim();
    const trimmedCompany = input.company?.trim() ?? '';

    const payload = await executeGraphQL<GraphQLRegisterEnvelope>(REGISTER_MUTATION, {
      username: trimmedUsername,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: trimmedEmail,
      password: input.password,
      phone: input.phone.trim(),
      company: trimmedCompany.length > 0 ? trimmedCompany : null,
      address1: input.address1.trim(),
      city: input.city.trim(),
      postcode: input.postcode.trim(),
    });

    if (payload.errors?.length) {
      throw new Error(parseGraphQLError(payload.errors[0]?.message, 'No se pudo completar el registro.'));
    }

    const registeredCustomerId = payload.data?.registerCustomer?.customer?.id;

    if (!registeredCustomerId) {
      throw new Error('El servidor no devolvió confirmación del cliente registrado.');
    }

    await login(trimmedUsername, input.password);
  }

  async function sendPasswordResetEmail(usernameOrEmail: string): Promise<void> {
    const trimmedIdentifier = usernameOrEmail.trim();

    if (!trimmedIdentifier) {
      throw new Error('Ingresa tu correo electrónico o nombre de usuario.');
    }

    const payload = await executeGraphQL<GraphQLSendPasswordResetEnvelope>(
      SEND_PASSWORD_RESET_MUTATION,
      { username: trimmedIdentifier },
    );

    if (payload.errors?.length) {
      throw new Error(
        parseGraphQLError(
          payload.errors[0]?.message,
          'No se pudo procesar la solicitud de recuperación.',
        ),
      );
    }

    if (!payload.data?.sendPasswordResetEmail) {
      throw new Error('El servidor no confirmó el envío del correo de recuperación.');
    }
  }

  async function resetUserPassword(key: string, login: string, newPassword: string): Promise<void> {
    const trimmedKey = key.trim();
    const trimmedLogin = login.trim();

    if (!trimmedKey || !trimmedLogin) {
      throw new Error('El enlace de recuperación no es válido o ha expirado.');
    }

    if (!newPassword.trim()) {
      throw new Error('La nueva contraseña es obligatoria.');
    }

    const payload = await executeGraphQL<GraphQLResetUserPasswordEnvelope>(
      RESET_USER_PASSWORD_MUTATION,
      {
        key: trimmedKey,
        login: trimmedLogin,
        password: newPassword,
      },
    );

    if (payload.errors?.length) {
      throw new Error(
        parseGraphQLError(payload.errors[0]?.message, 'No se pudo restablecer la contraseña.'),
      );
    }

    const resetUsername = payload.data?.resetUserPassword?.user?.username;

    if (!resetUsername) {
      throw new Error('El servidor no confirmó el cambio de contraseña.');
    }
  }

  async function updateCustomerDetails(customerData: CustomerDetailsInput): Promise<boolean> {
    if (!isAuthenticated.value || !token.value) {
      throw new Error('Debes iniciar sesión para actualizar tu información corporativa.');
    }

    const trimmedPhone = customerData.phone.trim();
    const trimmedCompany = customerData.company?.trim() ?? '';
    const trimmedAddress1 = customerData.address1.trim();
    const trimmedCity = customerData.city.trim();
    const trimmedPostcode = customerData.postcode.trim();

    if (!trimmedPhone) {
      throw new Error('El teléfono de facturación es obligatorio.');
    }

    if (!trimmedAddress1) {
      throw new Error('La dirección de envío es obligatoria.');
    }

    if (!trimmedCity) {
      throw new Error('La ciudad es obligatoria.');
    }

    if (!trimmedPostcode) {
      throw new Error('El código postal es obligatorio.');
    }

    isUpdatingCustomer.value = true;

    try {
      const resolvedCustomerId = await resolveCustomerId(token.value);

      const payload = await executeAuthenticatedGraphQL<GraphQLUpdateCustomerEnvelope>(
        UPDATE_CUSTOMER_MUTATION,
        {
          id: resolvedCustomerId,
          phone: trimmedPhone,
          company: trimmedCompany.length > 0 ? trimmedCompany : null,
          address1: trimmedAddress1,
          city: trimmedCity,
          postcode: trimmedPostcode,
        },
        token.value,
      );

      if (payload.errors?.length) {
        throw new Error(
          parseGraphQLError(payload.errors[0]?.message, 'No se pudo actualizar la información corporativa.'),
        );
      }

      const updatedCustomer = payload.data?.updateCustomer?.customer;

      if (!updatedCustomer?.billing || !updatedCustomer.shipping) {
        throw new Error('El servidor no devolvió los datos actualizados del cliente.');
      }

      customerDetails.value = mapCustomerDetailsFromResponse(
        updatedCustomer.billing,
        updatedCustomer.shipping,
      );

      return true;
    } finally {
      isUpdatingCustomer.value = false;
    }
  }

  async function changePassword(newPassword: string): Promise<boolean> {
    if (!isAuthenticated.value || !token.value) {
      throw new Error('Debes iniciar sesión para cambiar tu contraseña.');
    }

    const trimmedPassword = newPassword.trim();

    if (!trimmedPassword) {
      throw new Error('La nueva contraseña es obligatoria.');
    }

    if (trimmedPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }

    isChangingPassword.value = true;

    try {
      const resolvedUserId = await resolveCustomerId(token.value);

      const payload = await executeAuthenticatedGraphQL<GraphQLUpdateUserPasswordEnvelope>(
        CHANGE_USER_PASSWORD_MUTATION,
        {
          id: resolvedUserId,
          password: trimmedPassword,
        },
        token.value,
      );

      if (payload.errors?.length) {
        throw new Error(
          parseGraphQLError(payload.errors[0]?.message, 'No se pudo cambiar la contraseña.'),
        );
      }

      const updatedUserId = payload.data?.updateUser?.user?.databaseId;

      if (!updatedUserId) {
        throw new Error('El servidor no confirmó el cambio de contraseña.');
      }

      return true;
    } finally {
      isChangingPassword.value = false;
    }
  }

  function logout(): void {
    clearStorage();

    token.value = null;
    userEmail.value = null;
    displayName.value = null;
    customerId.value = null;
    customerDetails.value = null;
    isAuthenticated.value = false;

    syncGraphQLAuthHeaders(null);
  }

  return {
    token,
    userEmail,
    displayName,
    customerId,
    customerDetails,
    isAuthenticated,
    isUpdatingCustomer,
    isLoadingCustomerDetails,
    isChangingPassword,
    hydrate,
    login,
    register,
    sendPasswordResetEmail,
    resetUserPassword,
    fetchCustomerDetails,
    updateCustomerDetails,
    changePassword,
    logout,
  };
});
