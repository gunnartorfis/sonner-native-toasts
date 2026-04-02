import { Host, List, Button as SwiftUIButton } from '@expo/ui/swift-ui';
import * as React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

const ToastDemo: React.FC = () => {
  const [toastId, setToastId] = React.useState<string | number | null>(null);

  return (
    <Host style={{ flex: 1 }}>
      <List scrollEnabled listStyle="insetGrouped">
        <SwiftUIButton
          variant="borderedProminent"
          onPress={() => {
            toast.success('Hello world', {});
          }}
        >
          Show basic toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          disabled={!toastId}
          onPress={() => toast.dismiss(toastId!)}
        >
          Dismiss active toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.dismiss();
            setToastId(null);
          }}
        >
          Dismiss all toasts
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.success('center', { position: 'center' });
          }}
        >
          Center
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
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
        >
          Test Stacked Toasts (Top)
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.success('First toast', {
              position: 'bottom-center',
              duration: 10000,
            });
            setTimeout(() => {
              toast.info('Second toast with longer text', {
                position: 'bottom-center',
                duration: 10000,
                description: 'This toast has a description to make it taller',
              });
            }, 500);
            setTimeout(() => {
              toast.error('Third toast', {
                position: 'bottom-center',
                duration: 10000,
              });
            }, 1000);
          }}
        >
          Test Stacked Toasts (Bottom)
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            // Test with stacking disabled - toasts should appear on top of each other
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
        >
          Test Multiple Toasts (No Stacking)
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.success('exit animation bottom', {
              position: 'bottom-center',
              duration: 5000,
            });
          }}
        >
          exit animation bottom
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            if (toastId) {
              toast.success('Updated!', {
                id: toastId,
                onDismiss: () => {
                  setToastId(null);
                },
                onAutoClose: () => {
                  setToastId(null);
                },
              });
            } else {
              const id = toast.success('Changes saved', {
                onDismiss: () => {
                  setToastId(null);
                },
                onAutoClose: () => {
                  setToastId(null);
                },
              });
              setToastId(id);
            }
          }}
        >
          {toastId ? 'Update toast' : 'Show toast'}
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.success('Changes saved', {
              description: 'Your changes have been saved successfully',
              closeButton: true,
            });
          }}
        >
          Show toast with description
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.warning('Rich colors', {
              description: 'Your changes have been saved successfully',
              richColors: true,
            });
          }}
        >
          Rich colors
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.success('Changes saved', {
              action: {
                label: 'See changes',
                onClick: () => {
                  console.log('Action pressed');
                },
              },
              description:
                'Your changes have been saved successfully. This might go into a newline but we handle that by wrapping the text.',
            });
          }}
        >
          Show toast with description and action
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() =>
            toast('Wiggle on update', {
              id: '123',
              description: new Date().toISOString(),
            })
          }
        >
          Wiggle on update
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            if (toastId) {
              toast.wiggle(toastId);
            }
            toast.wiggle('123');
          }}
        >
          Wiggle toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => toast('Inverted toast', { invert: true })}
        >
          Invert toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => toast('Custom id', { id: '123' })}
        >
          Custom id
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast('Custom icon', {
              icon: (
                <View>
                  <Text>🚀</Text>
                </View>
              ),
            });
          }}
        >
          Custom icon
        </SwiftUIButton>
        <SwiftUIButton variant="bordered" onPress={handleToast}>
          Show outside of a React component
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.promise(
              new Promise<string>((resolve) => {
                setTimeout(() => {
                  resolve('!');
                }, 2000);
              }),
              {
                loading: 'Loading...',
                success: (result) => `Success${result}`,
                error: 'Promise failed',
              }
            );
          }}
        >
          Toast with a successful promise
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.promise(
              new Promise<string>((_, reject) => {
                setTimeout(() => {
                  reject(new Error('promise failed'));
                }, 2000);
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
        >
          Toast with a failed promise
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            const id = toast('Blue screen of death', {
              action: {
                label: 'OK',
                onClick: () => {
                  toast.dismiss(id);
                },
              },
              unstyled: true,
              icon: (
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  source={require('../assets/windows-xp.png')}
                  style={{
                    width: 40,
                    height: 40,
                  }}
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
        >
          Windows XP with styles only
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() =>
            toast('AirPods Pro', {
              description: 'Connected',
              icon: (
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  src={require('../assets/airpods.png')}
                  style={{
                    width: 30,
                    height: 30,
                  }}
                />
              ),
              unstyled: true,
              closeButton: false,
              dismissible: false,
              styles: {
                toastContainer: {
                  alignItems: 'center',
                },
                toast: {
                  shadowOpacity: 0.0015 * 4 + 0.1,
                  shadowRadius: 3 * 4,
                  shadowOffset: {
                    height: 4,
                    width: 0,
                  },
                  elevation: 4,
                  backgroundColor: 'white',
                  borderRadius: 999999,
                  borderCurve: 'continuous',
                },
                toastContent: {
                  padding: 12,
                  paddingHorizontal: 32,
                },
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
        >
          iOS like toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
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
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: '600',
                    }}
                  >
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
                    onPress={() => {
                      console.log('pressed the modal');
                    }}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: '600',
                      }}
                    >
                      Press me
                    </Text>
                  </Pressable>
                </View>
              </View>,
              {
                duration: 30000,
                position: 'bottom-center',
              }
            );
          }}
        >
          Custom JSX
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() =>
            toast.success('Non-dismissible toast', { dismissible: false })
          }
        >
          Non-dismissible
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
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
        >
          Infinity toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast.error('Custom icon');
          }}
        >
          Custom icon in Toaster
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast('My cancel toast', {
              cancel: {
                label: 'Cancel',
                onClick: () => console.log('Cancel!'),
              },
            });
          }}
        >
          Cancel
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => {
            toast('JSX action', {
              description: 'This toast has a JSX action',
              action: (
                <Pressable onPress={() => console.log('JSX action')}>
                  <Text>Press me</Text>
                </Pressable>
              ),
            });
          }}
        >
          JSX action
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => toast.loading('Loading...')}
        >
          Loading variant
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() =>
            toast('Dynamic position', { position: 'bottom-center' })
          }
        >
          Dynamic position
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => toast.loading('Loading...')}
        >
          Loading icon override
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() =>
            toast('Dynamic position', { position: 'bottom-center' })
          }
        >
          Dynamic position
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
          onPress={() => toast.warning('Warning')}
        >
          Warning toast
        </SwiftUIButton>
        <SwiftUIButton
          variant="bordered"
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
        >
          OnPress action
        </SwiftUIButton>

        <SwiftUIButton
          variant="bordered"
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
        >
          Custom close button
        </SwiftUIButton>
      </List>
    </Host>
  );
};

const handleToast = () => {
  toast.info('I am outside!');
};

export default ToastDemo;
