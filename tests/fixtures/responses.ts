export const responseFixtures = {
  success: {
    status: 200,
    body: {
      message: "Success",
      data: {
        id: 1,
        name: "Test User",
        email: "test@example.com"
      }
    }
  },
  
  created: {
    status: 201,
    body: {
      message: "Resource created successfully",
      id: 123,
      timestamp: "2025-07-22T10:00:00Z"
    }
  },
  
  unauthorized: {
    status: 401,
    body: {
      error: "Unauthorized",
      message: "Invalid credentials"
    }
  },
  
  forbidden: {
    status: 403,
    body: {
      error: "Forbidden",
      message: "Access denied"
    }
  },
  
  notFound: {
    status: 404,
    body: {
      error: "Not Found",
      message: "Resource not found"
    }
  },
  
  serverError: {
    status: 500,
    body: {
      error: "Internal Server Error",
      message: "Something went wrong on our end"
    }
  },
  
  // For testing arrays/lists
  userList: {
    status: 200,
    body: {
      users: [
        { id: 1, name: "Alice", role: "admin" },
        { id: 2, name: "Bob", role: "user" },
        { id: 3, name: "Charlie", role: "user" }
      ],
      total: 3
    }
  },
  
  // Empty response
  noContent: {
    status: 204,
    body: null
  }
};

export const networkErrors = {
  connectionRefused: 'ECONNREFUSED',
  connectionReset: 'ECONNRESET',
  timeout: 'ETIMEDOUT',
  addressInfo: 'EADDRINFO',
  socketTimeout: 'ESOCKETTIMEDOUT'
};
