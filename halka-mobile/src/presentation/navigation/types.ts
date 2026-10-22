// Tipli navigasyon parametreleri
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WidgetId } from '@domain/entities/WidgetId';

// Alt sekmeler
export type MainTabParamList = {
  Today: undefined;
  Focus: undefined;
  Character: undefined;
  Halka: undefined;
  Stats: undefined;
};

// Kök yığın: oturum yokken Login/Register, varken Main + modal ekranlar
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  WidgetFocus: { widgetId: WidgetId };
  Catalog: undefined;
  Settings: undefined;
  Habits: undefined;
  CheckIn: { date: string };
  History: { date?: string } | undefined;
  CharacterSetup: { mode: 'create' | 'edit' };
  AvatarEditor: undefined;
  TraitDetail: { traitId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// useNavigation() için global tip tanımı
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
