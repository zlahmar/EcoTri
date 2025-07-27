export const getAuth = jest.fn(() => ({
  currentUser: {
    uid: "test-user-id",
    displayName: "Test User"
  }
})); 