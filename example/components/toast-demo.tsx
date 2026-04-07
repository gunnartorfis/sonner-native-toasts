import {
  Host,
  Form,
  Section,
  Button as SwiftUIButton,
  Picker,
  Toggle,
  Text as SwiftUIText,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  pickerStyle,
  tag,
  disabled as disabledModifier,
} from '@expo/ui/swift-ui/modifiers';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import {
  toast,
  type AutoWiggle,
  type ToastPosition,
  type ToastSwipeDirection,
  type ToastTheme,
} from 'sonner-native';

const ToastDemo: React.FC = () => {
  const [toastId, setToastId] = React.useState<string | number | null>(null);
  const router = useRouter();
  const params = useGlobalSearchParams<{
    stacking?: string;
    position?: string;
    theme?: string;
    swipeDirection?: string;
    closeButton?: string;
    visibleToasts?: string;
    autoWiggle?: string;
    richColors?: string;
    invert?: string;
  }>();

  const position = (params.position as ToastPosition) || 'top-center';
  const stackingEnabled = params.stacking !== 'false';
  const theme = (params.theme as ToastTheme) || 'system';
  const swipeDirection =
    (params.swipeDirection as ToastSwipeDirection) || 'up';
  const closeButton = params.closeButton !== 'false';
  const visibleToasts = parseInt(params.visibleToasts || '4', 10);
  const autoWiggle = (params.autoWiggle as AutoWiggle) || 'toast-change';
  const richColors = params.richColors === 'true';
  const invert = params.invert === 'true';

  const setParam = (key: string, value: string) => {
    router.setParams({ [key]: value });
  };

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section>
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast.dismiss();
              setToastId(null);
            }}
            label="Dismiss All"
          />
        </Section>
        <Section title="Toaster Config">
          <Picker
            label="Position"
            selection={position}
            onSelectionChange={(v) => setParam('position', v as string)}
            modifiers={[pickerStyle('menu')]}
          >
            <SwiftUIText modifiers={[tag('top-center')]}>Top</SwiftUIText>
            <SwiftUIText modifiers={[tag('center')]}>Center</SwiftUIText>
            <SwiftUIText modifiers={[tag('bottom-center')]}>
              Bottom
            </SwiftUIText>
          </Picker>
          <Picker
            label="Theme"
            selection={theme}
            onSelectionChange={(v) => setParam('theme', v as string)}
            modifiers={[pickerStyle('menu')]}
          >
            <SwiftUIText modifiers={[tag('system')]}>System</SwiftUIText>
            <SwiftUIText modifiers={[tag('light')]}>Light</SwiftUIText>
            <SwiftUIText modifiers={[tag('dark')]}>Dark</SwiftUIText>
          </Picker>
          <Picker
            label="Swipe Direction"
            selection={swipeDirection}
            onSelectionChange={(v) =>
              setParam('swipeDirection', v as string)
            }
            modifiers={[pickerStyle('menu')]}
          >
            <SwiftUIText modifiers={[tag('up')]}>Up</SwiftUIText>
            <SwiftUIText modifiers={[tag('left')]}>Left</SwiftUIText>
          </Picker>
          <Picker
            label="Auto Wiggle"
            selection={autoWiggle}
            onSelectionChange={(v) => setParam('autoWiggle', v as string)}
            modifiers={[pickerStyle('menu')]}
          >
            <SwiftUIText modifiers={[tag('never')]}>Never</SwiftUIText>
            <SwiftUIText modifiers={[tag('toast-change')]}>
              On Change
            </SwiftUIText>
            <SwiftUIText modifiers={[tag('always')]}>Always</SwiftUIText>
          </Picker>
          <Picker
            label="Visible Toasts"
            selection={String(visibleToasts)}
            onSelectionChange={(v) =>
              setParam('visibleToasts', v as string)
            }
            modifiers={[pickerStyle('menu')]}
          >
            {['1', '2', '3', '4', '5'].map((n) => (
              <SwiftUIText key={n} modifiers={[tag(n)]}>
                {n}
              </SwiftUIText>
            ))}
          </Picker>
          <Toggle
            label="Stacking"
            isOn={stackingEnabled}
            onIsOnChange={(v) => setParam('stacking', String(v))}
          />
          <Toggle
            label="Close Button"
            isOn={closeButton}
            onIsOnChange={(v) => setParam('closeButton', String(v))}
          />
          <Toggle
            label="Rich Colors"
            isOn={richColors}
            onIsOnChange={(v) => setParam('richColors', String(v))}
          />
          <Toggle
            label="Invert"
            isOn={invert}
            onIsOnChange={(v) => setParam('invert', String(v))}
          />
        </Section>

        <Section title="Basic">
          <SwiftUIButton
            modifiers={[buttonStyle('borderedProminent')]}
            onPress={() => toast.success('Hello world', {})}
            label="Show basic toast"
          />
          <SwiftUIButton
            modifiers={[
              buttonStyle('bordered'),
              disabledModifier(!toastId),
            ]}
            onPress={() => {
              toast.dismiss(toastId!);
              setToastId(null);
            }}
            label="Dismiss active toast"
          />
        </Section>

        <Section title="Variants">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.success('Success')}
            label="Success"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.error('Error')}
            label="Error"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.warning('Warning')}
            label="Warning"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.info('Info')}
            label="Info"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.loading('Loading...')}
            label="Loading"
          />
        </Section>

        <Section title="Content">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast.success('Changes saved', {
                description: 'Your changes have been saved successfully',
                closeButton: true,
              })
            }
            label="With description"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast.success('Changes saved', {
                action: {
                  label: 'See changes',
                  onClick: () => console.log('Action pressed'),
                },
                description:
                  'Your changes have been saved successfully. This might go into a newline but we handle that by wrapping the text.',
              })
            }
            label="With description & action"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast('Custom icon', {
                icon: (
                  <View>
                    <Text>🚀</Text>
                  </View>
                ),
              })
            }
            label="Custom icon"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast('My cancel toast', {
                cancel: {
                  label: 'Cancel',
                  onClick: () => console.log('Cancel!'),
                },
              })
            }
            label="Cancel button"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast('JSX action', {
                description: 'This toast has a JSX action',
                action: (
                  <Pressable onPress={() => console.log('JSX action')}>
                    <Text>Press me</Text>
                  </Pressable>
                ),
              })
            }
            label="JSX action"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast.warning('Rich colors', {
                description: 'Your changes have been saved successfully',
                richColors: true,
              })
            }
            label="Rich colors"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast('Inverted toast', { invert: true })}
            label="Invert toast"
          />
        </Section>

        <Section title="Stacking">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast.success('First toast', {
                position: 'top-center',
                duration: 10000,
              });
              setTimeout(() => {
                toast.info('Second toast with longer text that wraps', {
                  position: 'top-center',
                  duration: 10000,
                  description:
                    'This is a description that makes the toast taller',
                });
              }, 500);
              setTimeout(() => {
                toast.warning('Third toast', {
                  position: 'top-center',
                  duration: 10000,
                });
              }, 1000);
              setTimeout(() => {
                toast.error('Fourth toast with action', {
                  position: 'top-center',
                  duration: 10000,
                  action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo clicked'),
                  },
                });
              }, 1500);
            }}
            label="Stacked (Top)"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast.success('First toast', {
                position: 'bottom-center',
                duration: 10000,
              });
              setTimeout(() => {
                toast.info('Second toast with longer text', {
                  position: 'bottom-center',
                  duration: 10000,
                  description:
                    'This toast has a description to make it taller',
                });
              }, 500);
              setTimeout(() => {
                toast.error('Third toast', {
                  position: 'bottom-center',
                  duration: 10000,
                });
              }, 1000);
            }}
            label="Stacked (Bottom)"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast('Stacking disabled test 1', {
                position: 'top-center',
                duration: 10000,
              });
              setTimeout(() => {
                toast('Stacking disabled test 2', {
                  position: 'top-center',
                  duration: 10000,
                });
              }, 300);
            }}
            label="Multiple (No Stacking)"
          />
        </Section>

        <Section title="Update & Wiggle">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              if (toastId) {
                toast.success('Updated!', {
                  id: toastId,
                  onDismiss: () => setToastId(null),
                  onAutoClose: () => setToastId(null),
                });
              } else {
                const id = toast.success('Changes saved', {
                  onDismiss: () => setToastId(null),
                  onAutoClose: () => setToastId(null),
                });
                setToastId(id);
              }
            }}
            label={toastId ? 'Update toast' : 'Show toast'}
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast('Wiggle on update', {
                id: '123',
                description: new Date().toISOString(),
              })
            }
            label="Wiggle on update"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              if (toastId) toast.wiggle(toastId);
              toast.wiggle('123');
            }}
            label="Wiggle toast"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast('Custom id', { id: '123' })}
            label="Custom id"
          />
        </Section>

        <Section title="Promise">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast.promise(
                new Promise<string>((resolve) => {
                  setTimeout(() => resolve('!'), 2000);
                }),
                {
                  loading: 'Loading...',
                  success: (result) => `Success${result}`,
                  error: 'Promise failed',
                }
              );
            }}
            label="Successful promise"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast.promise(
                new Promise<string>((_, reject) => {
                  setTimeout(
                    () => reject(new Error('promise failed')),
                    2000
                  );
                }),
                {
                  loading: 'Loading...',
                  success: (result) => `Promise resolved: ${result}`,
                  error: (error) =>
                    error instanceof Error
                      ? `catch 'Error' ${error.message}`
                      : 'Promise failed',
                }
              );
            }}
            label="Failed promise"
          />
        </Section>

        <Section title="Behavior">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast.success('Non-dismissible toast', {
                dismissible: false,
              })
            }
            label="Non-dismissible"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              const id = toast.success('Infinity toast', {
                duration: Infinity,
                dismissible: false,
                id: 'infinity',
                action: {
                  label: 'Acknowledge',
                  onClick: () => {
                    toast.dismiss(id);
                    setToastId(null);
                  },
                },
              });
              setToastId(id);
            }}
            label="Infinity duration"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              const id = toast.success('OnPress action', {
                dismissible: false,
                onPress: () => {
                  toast.dismiss(id);
                  setToastId(null);
                  Alert.alert('press');
                },
              });
              setToastId(id);
            }}
            label="OnPress action"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              const id = toast.success('Custom close button', {
                close: (
                  <Pressable onPress={() => toast.dismiss(id)}>
                    <Text>close</Text>
                  </Pressable>
                ),
                closeButton: undefined,
              });
            }}
            label="Custom close button"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast.success('Exit bottom', {
                position: 'bottom-center',
                duration: 5000,
              })
            }
            label="Exit animation (bottom)"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.success('center', { position: 'center' })}
            label="Center position"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast('Dynamic position', { position: 'bottom-center' })
            }
            label="Dynamic position (bottom)"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={handleToast}
            label="Outside React component"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => toast.error('Custom icon')}
            label="Custom icon in Toaster"
          />
        </Section>

        <Section title="Styled">
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              const id = toast('Blue screen of death', {
                action: {
                  label: 'OK',
                  onClick: () => toast.dismiss(id),
                },
                unstyled: true,
                icon: (
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../assets/windows-xp.png')}
                    style={{ width: 40, height: 40 }}
                  />
                ),
                actionButtonStyle: {
                  borderStyle: 'dashed',
                  borderColor: 'black',
                  borderWidth: 2,
                  borderRadius: 2,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  marginTop: 8,
                  alignSelf: 'center',
                },
                actionButtonTextStyle: {
                  fontSize: 14,
                  color: 'black',
                  textAlign: 'center',
                },
                styles: {
                  toastContainer: {
                    paddingHorizontal: 16,
                    marginBottom: 16,
                  },
                  toast: {
                    backgroundColor: '#ECE9D8',
                    borderRadius: 3,
                    padding: 15,
                    borderColor: '#0055EA',
                    borderWidth: 2,
                  },
                  toastContent: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  },
                  title: {
                    fontSize: 14,
                    fontWeight: 'light',
                    fontFamily: 'sans-serif',
                    color: 'black',
                    marginBottom: 5,
                    marginLeft: 4,
                    textAlign: 'center',
                  },
                  description: {
                    fontSize: 14,
                    color: '#000000',
                    marginBottom: 10,
                  },
                  closeButton: {
                    backgroundColor: '#DD3C14',
                    borderRadius: 2,
                    alignSelf: 'flex-start',
                  },
                },
              });
            }}
            label="Windows XP"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() =>
              toast('AirPods Pro', {
                description: 'Connected',
                icon: (
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    src={require('../assets/airpods.png')}
                    style={{ width: 30, height: 30 }}
                  />
                ),
                unstyled: true,
                closeButton: false,
                dismissible: false,
                styles: {
                  toastContainer: { alignItems: 'center' },
                  toast: {
                    shadowOpacity: 0.0015 * 4 + 0.1,
                    shadowRadius: 3 * 4,
                    shadowOffset: { height: 4, width: 0 },
                    elevation: 4,
                    backgroundColor: 'white',
                    borderRadius: 999999,
                    borderCurve: 'continuous',
                  },
                  toastContent: { padding: 12, paddingHorizontal: 32 },
                  title: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 4,
                  },
                  description: {
                    fontSize: 14,
                    color: '#666',
                    textAlign: 'center',
                  },
                },
              })
            }
            label="iOS style"
          />
          <SwiftUIButton
            modifiers={[buttonStyle('bordered')]}
            onPress={() => {
              toast.custom(
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: '80%',
                      backgroundColor: '#26252A',
                      paddingLeft: 24,
                      paddingRight: 8,
                      paddingVertical: 8,
                      borderRadius: 999,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderCurve: 'continuous',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      Custom JSX
                    </Text>
                    <Pressable
                      style={{
                        backgroundColor: '#40424B',
                        borderWidth: 1,
                        borderColor: '#55555C',
                        borderRadius: 999,
                        padding: 8,
                      }}
                      onPress={() => console.log('pressed the modal')}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600' }}>
                        Press me
                      </Text>
                    </Pressable>
                  </View>
                </View>,
                { duration: 30000, position: 'bottom-center' }
              );
            }}
            label="Custom JSX"
          />
        </Section>
      </Form>
    </Host>
  );
};

const handleToast = () => {
  toast.info('I am outside!');
};

export default ToastDemo;
