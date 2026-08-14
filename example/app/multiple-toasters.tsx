import * as React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toaster, toast } from 'sonner-native';

const SHEET_CHANNEL = 'sheet';

const Row: React.FC<{ label: string; onPress: () => void }> = ({
  label,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 10,
        backgroundColor: pressed
          ? isDark
            ? '#333'
            : '#ddd'
          : isDark
            ? '#1c1c1e'
            : '#f2f2f7',
      })}
    >
      <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
};

const MultipleToastersScreen: React.FC = () => {
  const [sheetVisible, setSheetVisible] = React.useState(false);
  // A ref, not state: it is only ever written and read from handlers, so
  // storing it in state would re-render the screen for nothing.
  const lastSheetToast = React.useRef<string | number | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            color: isDark ? '#8e8e93' : '#6d6d72',
            marginBottom: 12,
          }}
        >
          The root Toaster and the in-sheet Toaster are separate channels. Toasts
          sent with {'{ toasterId: \'sheet\' }'} only appear in the sheet.
        </Text>

        <Row label="Root toast" onPress={() => toast('Root toast')} />
        <Row
          label="Sheet toast while closed (waits for the sheet to open)"
          onPress={() =>
            toast('I waited for the sheet to open', {
              toasterId: SHEET_CHANNEL,
            })
          }
        />
        <Row
          label="Toast with a typo'd toasterId (logs a dev warning)"
          onPress={() => toast('Goes nowhere', { toasterId: 'shet' })}
        />
        <Row label="Open sheet" onPress={() => setSheetVisible(true)} />
        <Row label="Dismiss all (both channels)" onPress={() => toast.dismiss()} />
      </ScrollView>

      <Modal
        visible={sheetVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
        onRequestClose={() => setSheetVisible(false)}
      >
        {/* Gesture handling and the Toaster both need to live inside the
            modal's own native view hierarchy. */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: isDark ? '#1c1c1e' : '#fff' }}
          >
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text
                style={{
                  color: isDark ? '#fff' : '#000',
                  fontSize: 20,
                  fontWeight: '600',
                  marginBottom: 12,
                }}
              >
                Inside the sheet
              </Text>

              <Row
                label="Sheet toast"
                onPress={() => {
                  lastSheetToast.current = toast('Toast inside the sheet', {
                    toasterId: SHEET_CHANNEL,
                  });
                }}
              />
              <Row
                label="Three sheet toasts (visibleToasts=2 here)"
                onPress={() => {
                  toast('Sheet 1', { toasterId: SHEET_CHANNEL });
                  toast('Sheet 2', { toasterId: SHEET_CHANNEL });
                  toast('Sheet 3', { toasterId: SHEET_CHANNEL });
                }}
              />
              <Row
                label="Sheet promise"
                onPress={() =>
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 2000)),
                    {
                      loading: 'Saving in the sheet…',
                      success: () => 'Saved in the sheet',
                      error: 'Failed',
                      toasterId: SHEET_CHANNEL,
                    }
                  )
                }
              />
              <Row
                label="Root toast from inside the sheet"
                onPress={() => toast('Root toast (behind the sheet)')}
              />
              <Row
                label="Dismiss the last sheet toast by id"
                onPress={() => {
                  if (lastSheetToast.current !== null) {
                    toast.dismiss(lastSheetToast.current);
                    lastSheetToast.current = null;
                  }
                }}
              />
              <Row label="Close sheet" onPress={() => setSheetVisible(false)} />
            </ScrollView>

            {/* fullWindowOverlay={false} is required: the default iOS
                FullWindowOverlay lives in the app window, which this sheet is
                presented above. */}
            <Toaster
              id={SHEET_CHANNEL}
              fullWindowOverlay={false}
              position="bottom-center"
              visibleToasts={2}
              enableStacking
              closeButton
            />
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
};

export default MultipleToastersScreen;
