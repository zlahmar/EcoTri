export const requestCameraPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const launchCameraAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [{ uri: 'file://test-image.jpg' }],
});
export const launchImageLibraryAsync = jest.fn().mockResolvedValue({
  canceled: false,
  assets: [{ uri: 'file://test-image.jpg' }],
}); 