# Documentation des Mocks - EcoTri

## Vue d'ensemble

Ce document détaille tous les mocks créés pour les tests du projet EcoTri, leur utilisation et leur maintenance.

## Structure des mocks

```
__mocks__/
├── expo-vector-icons.ts      # Mocks pour les icônes Expo
├── react-native.ts           # Mocks pour React Native
├── react-native-paper.ts     # Mocks pour React Native Paper
├── react-native-safe-area-context.ts
├── react-native-maps.ts      # Mocks pour les cartes
├── expo-image-picker.ts      # Mocks pour la sélection d'images
├── expo-location.ts          # Mocks pour la géolocalisation
├── firebaseConfig.ts         # Mocks pour la config Firebase
└── firebase/                 # Mocks pour les services Firebase
    ├── auth.ts
    ├── firestore.ts
    ├── functions.ts
    └── storage.ts
```

## Mocks principaux

### 1. expo-vector-icons.ts

**Objectif :** Mocker les icônes Expo pour éviter les erreurs de rendu dans les tests.

**Implémentation :**

```typescript
import React from 'react';
import { Text } from 'react-native';

export const MaterialCommunityIcons = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const MaterialIcons = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const Ionicons = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const FontAwesome = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const FontAwesome5 = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export default {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
};
```

**Utilisation :**

```typescript
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Dans les tests, l'icône sera rendue comme un Text avec le nom
<MaterialCommunityIcons name="recycle" size={24} color="green" />
// Résultat : <Text testID="icon">recycle</Text>
```

### 2. react-native.ts

**Objectif :** Mocker les composants React Native pour les tests.

**Implémentation :**

```typescript
import React from 'react';

// Composants de base
export const View = ({ children, ...props }: any) =>
  React.createElement('div', props, children);

export const Text = ({ children, ...props }: any) =>
  React.createElement('span', props, children);

export const TouchableOpacity = ({ children, onPress, ...props }: any) =>
  React.createElement('button', { ...props, onClick: onPress }, children);

export const TextInput = ({ value, onChangeText, ...props }: any) =>
  React.createElement('input', { ...props, value, onChange: onChangeText });

export const ScrollView = ({ children, ...props }: any) =>
  React.createElement(
    'div',
    { ...props, style: { overflow: 'auto' } },
    children
  );

export const FlatList = ({ data, renderItem, keyExtractor, ...props }: any) =>
  React.createElement(
    'div',
    props,
    data?.map((item: any, index: number) =>
      React.createElement(
        'div',
        { key: keyExtractor?.(item, index) || index },
        renderItem({ item, index })
      )
    )
  );

export const Image = ({ source, ...props }: any) =>
  React.createElement('img', { ...props, src: source?.uri || source });

// APIs
export const Alert = {
  alert: jest.fn(),
};

export const Platform = {
  OS: 'web',
  select: jest.fn((obj: any) => obj.web || obj.default),
};

export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 667 })),
};

export const StatusBar = {
  setBarStyle: jest.fn(),
  setBackgroundColor: jest.fn(),
};

export const Linking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
};

export const BackHandler = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

export const Animated = {
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  timing: jest.fn(() => ({
    start: jest.fn(),
  })),
};

export const StyleSheet = {
  create: (styles: any) => styles,
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
};
```

**Utilisation :**

```typescript
import { View, Text, TouchableOpacity, Alert } from 'react-native';

// Les composants sont rendus comme des éléments HTML
<View>(<Text>Hello) <
  /Text></Veiw >
  // Résultat : <div><span>Hello</span></div>

  // Les APIs sont mockées
  Alert.alert('Title', 'Message');
// Vérification : expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message');
```

### 3. react-native-paper.ts

**Objectif :** Mocker les composants React Native Paper.

**Implémentation :**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const Appbar = {
  Header: ({ children, ...props }: any) => <View {...props}>{children}</View>,
};

export const IconButton = ({ onPress, icon, ...props }: any) => (
  <TouchableOpacity testID="icon-button" onPress={onPress} {...props}>
    <Text>{icon}</Text>
  </TouchableOpacity>
);

export const Button = ({ onPress, children, ...props }: any) => (
  <TouchableOpacity testID="button" onPress={onPress} {...props}>
    <Text>{children}</Text>
  </TouchableOpacity>
);

export const Card = ({ children, ...props }: any) => (
  <View testID="card" {...props}>{children}</View>
);

export const Chip = ({ onPress, children, ...props }: any) => (
  <TouchableOpacity testID="chip" onPress={onPress} {...props}>
    <Text>{children}</Text>
  </TouchableOpacity>
);

export const TextInput = ({ value, onChangeText, placeholder, ...props }: any) => (
  <TextInput
    testID="text-input"
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    {...props}
  />
);

export const List = {
  Item: ({ title, description, ...props }: any) => (
    <View testID="list-item" {...props}>
      <Text>{title}</Text>
      {description && <Text>{description}</Text>}
    </View>
  ),
};

export const Menu = ({ visible, onDismiss, anchor, children, ...props }: any) => (
  visible ? (
    <View testID="menu" {...props}>
      {children}
    </View>
  ) : null
);

export default {
  Appbar,
  IconButton,
  Button,
  Card,
  Chip,
  TextInput,
  List,
  Menu,
};
```

### 4. react-native-maps.ts

**Objectif :** Mocker les composants de carte.

**Implémentation :**

```typescript
import React from 'react';
import { View } from 'react-native';

export const MapView = ({ children, ...props }: any) => (
  <View testID="map-view" {...props}>{children}</View>
);

export const Marker = ({ coordinate, title, description, ...props }: any) => (
  <View testID="marker" {...props}>
    <Text>{title}</Text>
    {description && <Text>{description}</Text>}
  </View>
);

export const Callout = ({ children, ...props }: any) => (
  <View testID="callout" {...props}>{children}</View>
);

export default {
  MapView,
  Marker,
  Callout,
};
```

### 5. expo-location.ts

**Objectif :** Mocker les services de géolocalisation.

**Implémentation :**

```typescript
export const requestForegroundPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted' })
);

export const getCurrentPositionAsync = jest.fn(() =>
  Promise.resolve({
    coords: {
      latitude: 48.8566,
      longitude: 2.3522,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  })
);

export const watchPositionAsync = jest.fn(() =>
  Promise.resolve({
    remove: jest.fn(),
  })
);

export default {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  watchPositionAsync,
};
```

### 6. expo-image-picker.ts

**Objectif :** Mocker la sélection d'images.

**Implémentation :**

```typescript
export const launchImageLibraryAsync = jest.fn(() =>
  Promise.resolve({
    canceled: false,
    assets: [{ uri: 'file://mock-image.jpg' }],
  })
);

export const launchCameraAsync = jest.fn(() =>
  Promise.resolve({
    canceled: false,
    assets: [{ uri: 'file://mock-photo.jpg' }],
  })
);

export const requestMediaLibraryPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted' })
);

export const requestCameraPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: 'granted' })
);

export const MediaTypeOptions = {
  Images: 'Images',
  Videos: 'Videos',
  All: 'All',
};

export default {
  launchImageLibraryAsync,
  launchCameraAsync,
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  MediaTypeOptions,
};
```

## Mocks Firebase

### firebaseConfig.ts

```typescript
export const auth = {
  currentUser: {
    uid: 'test-user-id',
    email: 'test@example.com',
  },
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: 'new-user-id' } })
  ),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: 'test-user-id' } })
  ),
};

export const db = {};

export const storage = {};

export default {
  auth,
  db,
  storage,
};
```

### firebase/auth.ts

```typescript
export const createUserWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: 'new-user-id' } })
);

export const signInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: 'test-user-id' } })
);

export const signOut = jest.fn(() => Promise.resolve());

export const onAuthStateChanged = jest.fn(callback => {
  callback({ uid: 'test-user-id' });
  return () => {};
});
```

### firebase/firestore.ts

```typescript
export const getDoc = jest.fn();
export const getDocs = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const collection = jest.fn();
export const doc = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const startAfter = jest.fn();
```

### firebase/storage.ts

```typescript
export const ref = jest.fn();
export const uploadBytes = jest.fn(() => Promise.resolve());
export const getDownloadURL = jest.fn(() =>
  Promise.resolve('https://mock-url.com')
);
export const deleteObject = jest.fn(() => Promise.resolve());
```

### firebase/functions.ts

```typescript
export const getFunctions = jest.fn(() => ({}));
export const httpsCallable = jest.fn(() =>
  jest.fn(() => Promise.resolve({ data: {} }))
);
```

## Configuration Jest

### jest.config.ts

```typescript
export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|react-native-maps|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-paper|@testing-library)/)',
  ],
  moduleNameMapper: {
    '^firebaseConfig$': '<rootDir>/__mocks__/firebaseConfig.ts',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.ts',
    '^react-native-maps$': '<rootDir>/__mocks__/react-native-maps.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^react-native-paper$': '<rootDir>/__mocks__/react-native-paper.ts',
    '^react-native-safe-area-context$':
      '<rootDir>/__mocks__/react-native-safe-area-context.ts',
    '^expo-image-picker$': '<rootDir>/__mocks__/expo-image-picker.ts',
    '^expo-location$': '<rootDir>/__mocks__/expo-location.ts',
    '^firebase/auth$': '<rootDir>/__mocks__/firebase/auth.ts',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebase/firestore.ts',
    '^firebase/storage$': '<rootDir>/__mocks__/firebase/storage.ts',
    '^firebase/functions$': '<rootDir>/__mocks__/firebase/functions.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## Utilisation dans les tests

### Exemple de test avec mocks

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MyComponent from '../MyComponent';

// Les mocks sont automatiquement utilisés
describe('MyComponent', () => {
  it('renders with icon', () => {
    const { getByTestId } = render(
      <MyComponent icon={<MaterialCommunityIcons name="recycle" />} />
    );

    expect(getByTestId('icon')).toBeTruthy();
  });
});
```

### Test de service avec Firebase

```typescript
import { getDoc, getDocs } from 'firebase/firestore';
import AdviceService from '../services/adviceService';

jest.mock('firebase/firestore');

describe('AdviceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches advice', async () => {
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: (callback: any) =>
        [{ id: '1', data: () => ({ title: 'Test' }) }].forEach(callback),
    });

    const service = new AdviceService();
    const result = await service.getAllAdvice();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test');
  });
});
```

## Maintenance des mocks

### Ajout d'un nouveau mock

1. **Créer le fichier** dans `__mocks__/`
2. **Implémenter** les fonctions/objets nécessaires
3. **Ajouter** le mapping dans `jest.config.ts`
4. **Tester** le mock dans un test

### Mise à jour des mocks

1. **Identifier** les nouvelles APIs à mocker
2. **Ajouter** les nouvelles fonctions
3. **Maintenir** la compatibilité avec les tests existants
4. **Documenter** les changements

### Bonnes pratiques

1. **Simplicité** : Les mocks doivent être simples et prévisibles
2. **Cohérence** : Utiliser des patterns cohérents
3. **Documentation** : Documenter les comportements complexes
4. **Tests** : Tester les mocks eux-mêmes si nécessaire

## Dépannage

### Problèmes courants

#### 1. Mock non trouvé

```bash
# Vérifier le mapping dans jest.config.ts
# Vérifier que le fichier mock existe
```

#### 2. Mock ne fonctionne pas

```bash
# Vérifier l'import dans le fichier testé
# Vérifier que le mock exporte correctement
```

#### 3. Erreurs de type

```bash
# Ajouter les types TypeScript appropriés
# Utiliser `any` temporairement si nécessaire
```

### Logs utiles

```bash
# Voir les mocks utilisés
npm test -- --verbose

# Vérifier la configuration Jest
npm test -- --showConfig
```

## Conclusion

Les mocks permettent de :

- **Isoler** les tests des dépendances externes
- **Accélérer** l'exécution des tests
- **Contrôler** le comportement des APIs
- **Faciliter** les tests unitaires

Une maintenance régulière des mocks assure la fiabilité des tests et facilite le développement.
