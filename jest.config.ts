module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|react-native-maps|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-paper|@testing-library)/)',
  ],
  moduleNameMapper: {
    '^firebaseConfig$': '<rootDir>/__mocks__/firebaseConfig.ts',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebase/firestore.ts',
    '^firebase/auth$': '<rootDir>/__mocks__/firebase/auth.ts',
    '^firebase/storage$': '<rootDir>/__mocks__/firebase/storage.ts',
    '^firebase/functions$': '<rootDir>/__mocks__/firebase/functions.ts',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.ts',
    '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.ts',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.ts',
    '^react-native-paper$': '<rootDir>/__mocks__/react-native-paper.ts',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.ts',
    '^react-native-maps$': '<rootDir>/__mocks__/react-native-maps.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  globals: {
    __DEV__: false,
  },
  setupFilesAfterEnv: [],
};
