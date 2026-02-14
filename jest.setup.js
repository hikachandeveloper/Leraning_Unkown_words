// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock Supabase
jest.mock("./src/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn(),
    })),
  },
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useFocusEffect: jest.fn((cb) => cb()),
  Stack: {
    Screen: "Stack.Screen",
  },
  Link: "Link",
}));
