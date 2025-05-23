```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the root stack parameter list, which describes the structure of the navigation stack.
export type RootStackParamList = {
  Home: undefined; // 'Home' screen doesn't require any parameters
  PdfScreen: {uri: string}; // 'PdfScreen' expects a uri parameter of type string.  Important: added type safety to props, and removed a bug where there was no parameter defined.
};

// Define the props for the 'Home' screen, using NativeStackScreenProps and RootStackParamList.
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Define the props for the 'PdfScreen' screen, using NativeStackScreenProps and RootStackParamList.
export type PdfScreenProps = NativeStackScreenProps<RootStackParamList, 'PdfScreen'>;
```