const USER_INFO = `
  id
  name
  phone
  email
  roles
`;

export const REGISTER_MUTATION = `
mutation CreateUser($userData: mutationUserInput!) {
  createUser(data: $userData) {
    ${USER_INFO}
  }
}
`;

export const LOGIN_MUTATION = `
  mutation LoginCustomer($email: String!, $password: String!) {
    loginCustomer(email: $email, password: $password) {
      exp
      token
      user {
        ${USER_INFO}
      }
    }
  }
`;

export const LOGIN_ME = `
  query LoginMe {
    meUser {
      user {
        ${USER_INFO}
      }
    }
  }
`;

export const LOGOUT_MUTATION = `
mutation LogoutUser {
  logoutUser
}
`;
