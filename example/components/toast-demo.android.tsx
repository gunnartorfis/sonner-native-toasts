import {
  Host,
  LazyColumn,
  Button,
  OutlinedButton,
  Text as ComposeText,
  Switch,
  ListItem,
  Card,
  Column,
  HorizontalDivider,
  DropdownMenu,
  DropdownMenuItem,
} from '@expo/ui/jetpack-compose';
import { paddingAll, fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import * as React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import { useToasterParams } from '../hooks/useToasterParams';

type PickerOption = { label: string; value: string };

function PickerRow({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: PickerOption[];
  onSelect: (value: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? value;

  return (
    <DropdownMenu
      expanded={expanded}
      onDismissRequest={() => setExpanded(false)}
    >
      <DropdownMenu.Trigger>
        <ListItem modifiers={[fillMaxWidth()]}>
          <ListItem.HeadlineContent>
            <ComposeText>{label}</ComposeText>
          </ListItem.HeadlineContent>
          <ListItem.TrailingContent>
            <OutlinedButton onClick={() => setExpanded(true)}>
              <ComposeText>{selectedLabel}</ComposeText>
            </OutlinedButton>
          </ListItem.TrailingContent>
        </ListItem>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => {
              onSelect(opt.value);
              setExpanded(false);
            }}
          >
            <DropdownMenuItem.Text>
              <ComposeText>{opt.label}</ComposeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  );
}

function SwitchRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <ListItem modifiers={[fillMaxWidth()]}>
      <ListItem.HeadlineContent>
        <ComposeText>{label}</ComposeText>
      </ListItem.HeadlineContent>
      <ListItem.TrailingContent>
        <Switch value={value} onCheckedChange={onChange} />
      </ListItem.TrailingContent>
    </ListItem>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <ComposeText
      style={{ typography: 'titleSmall' }}
      modifiers={[paddingAll(12)]}
    >
      {title}
    </ComposeText>
  );
}

const ToastDemo: React.FC = () => {
  const [toastId, setToastId] = React.useState<string | number | null>(null);
  const {
    position,
    stackingEnabled,
    theme,
    swipeDirection,
    closeButton,
    visibleToasts,
    autoWiggle,
    richColors,
    invert,
    gap,
    setParam,
  } = useToasterParams();

  return (
    <Host style={{ flex: 1 }}>
      <LazyColumn
        verticalArrangement={{ spacedBy: 8 }}
        contentPadding={{ start: 16, end: 16, top: 8, bottom: 32 }}
      >
        <OutlinedButton
          onClick={() => {
            toast.dismiss();
            setToastId(null);
          }}
          modifiers={[fillMaxWidth()]}
        >
          <ComposeText>Dismiss All</ComposeText>
        </OutlinedButton>

        <SectionHeader title="Toaster Config" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column>
            <PickerRow
              label="Position"
              value={position}
              options={[
                { label: 'Top', value: 'top-center' },
                { label: 'Center', value: 'center' },
                { label: 'Bottom', value: 'bottom-center' },
              ]}
              onSelect={(v) => setParam('position', v)}
            />
            <HorizontalDivider />
            <PickerRow
              label="Theme"
              value={theme}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              onSelect={(v) => setParam('theme', v)}
            />
            <HorizontalDivider />
            <PickerRow
              label="Swipe Direction"
              value={swipeDirection}
              options={[
                { label: 'Up', value: 'up' },
                { label: 'Left', value: 'left' },
              ]}
              onSelect={(v) => setParam('swipeDirection', v)}
            />
            <HorizontalDivider />
            <PickerRow
              label="Auto Wiggle"
              value={autoWiggle}
              options={[
                { label: 'Never', value: 'never' },
                { label: 'On Change', value: 'toast-change' },
                { label: 'Always', value: 'always' },
              ]}
              onSelect={(v) => setParam('autoWiggle', v)}
            />
            <HorizontalDivider />
            <PickerRow
              label="Visible Toasts"
              value={String(visibleToasts)}
              options={['1', '2', '3', '4', '5'].map((n) => ({
                label: n,
                value: n,
              }))}
              onSelect={(v) => setParam('visibleToasts', v)}
            />
            <HorizontalDivider />
            <PickerRow
              label="Gap"
              value={String(gap ?? 'default')}
              options={[
                { label: 'Default', value: 'default' },
                ...['2', '4', '8', '16', '24', '32'].map((n) => ({
                  label: n,
                  value: n,
                })),
              ]}
              onSelect={(v) => setParam('gap', v === 'default' ? '' : v)}
            />
            <HorizontalDivider />
            <SwitchRow
              label="Stacking"
              value={stackingEnabled}
              onChange={(v) => setParam('stacking', String(v))}
            />
            <HorizontalDivider />
            <SwitchRow
              label="Close Button"
              value={closeButton}
              onChange={(v) => setParam('closeButton', String(v))}
            />
            <HorizontalDivider />
            <SwitchRow
              label="Rich Colors"
              value={richColors}
              onChange={(v) => setParam('richColors', String(v))}
            />
            <HorizontalDivider />
            <SwitchRow
              label="Invert"
              value={invert}
              onChange={(v) => setParam('invert', String(v))}
            />
          </Column>
        </Card>

        <SectionHeader title="Basic" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <Button
              onClick={() => toast.success('Hello world')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Show basic toast</ComposeText>
            </Button>
            <OutlinedButton
              onClick={() => {
                toast.dismiss(toastId!);
                setToastId(null);
              }}
              enabled={!!toastId}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Dismiss active toast</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Variants" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() => toast.success('Success')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Success</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast.error('Error')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Error</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast.warning('Warning')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Warning</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast.info('Info')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Info</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast.loading('Loading...')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Loading</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Content" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() =>
                toast.success('Changes saved', {
                  description: 'Your changes have been saved successfully',
                  closeButton: true,
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>With description</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.success('Changes saved', {
                  action: {
                    label: 'See changes',
                    onClick: () => console.log('Action pressed'),
                  },
                  description:
                    'Your changes have been saved successfully. This might go into a newline but we handle that by wrapping the text.',
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>With description & action</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast('Custom icon', {
                  icon: (
                    <View>
                      <Text>🚀</Text>
                    </View>
                  ),
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Custom icon</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast('My cancel toast', {
                  cancel: {
                    label: 'Cancel',
                    onClick: () => console.log('Cancel!'),
                  },
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Cancel button</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast('JSX action', {
                  description: 'This toast has a JSX action',
                  action: (
                    <Pressable onPress={() => console.log('JSX action')}>
                      <Text>Press me</Text>
                    </Pressable>
                  ),
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>JSX action</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.warning('Rich colors', {
                  description: 'Your changes have been saved successfully',
                  richColors: true,
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Rich colors</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast('Inverted toast', { invert: true })}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Invert toast</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Stacking" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Stacked (Top)</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Stacked (Bottom)</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Multiple (No Stacking)</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Update & Wiggle" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>
                {toastId ? 'Update toast' : 'Show toast'}
              </ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast('Wiggle on update', {
                  id: '123',
                  description: new Date().toISOString(),
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Wiggle on update</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
                if (toastId) toast.wiggle(toastId);
                toast.wiggle('123');
              }}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Wiggle toast</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast('Custom id', { id: '123' })}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Custom id</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Promise" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Successful promise</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Failed promise</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Behavior" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() =>
                toast.success('Non-dismissible toast', {
                  dismissible: false,
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Non-dismissible</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Infinity duration</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>OnPress action</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
                const id = toast.success('Custom close button', {
                  close: (
                    <Pressable onPress={() => toast.dismiss(id)}>
                      <Text>close</Text>
                    </Pressable>
                  ),
                  closeButton: undefined,
                });
              }}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Custom close button</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.success('Exit bottom', {
                  position: 'bottom-center',
                  duration: 5000,
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Exit animation (bottom)</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.success('center', { position: 'center' })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Center position</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast('Dynamic position', { position: 'bottom-center' })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Dynamic position (bottom)</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={handleToast}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Outside React component</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => toast.error('Custom icon')}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Custom icon in Toaster</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Styled" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() => {
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Windows XP</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
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
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>iOS style</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() => {
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
                  { position: 'bottom-center' }
                );
              }}
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Custom JSX</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>

        <SectionHeader title="Animations" />
        <Card modifiers={[fillMaxWidth()]}>
          <Column modifiers={[paddingAll(12)]}>
            <OutlinedButton
              onClick={() =>
                toast('Toaster-wide fade (uses Toaster animation prop)')
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Toaster-wide fade</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.success('Per-toast slide override', {
                  animation: {
                    enter: SlideInDown.duration(400),
                    exit: SlideOutDown.duration(300),
                  },
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Per-toast slide override</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.info('Per-toast explicit reset to default', {
                  animation: { enter: 'default', exit: 'default' },
                })
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Per-toast reset to default</ComposeText>
            </OutlinedButton>
            <OutlinedButton
              onClick={() =>
                toast.warning(
                  'Custom enter only — exit falls back to default',
                  {
                    animation: { enter: FadeIn.duration(600) },
                  }
                )
              }
              modifiers={[fillMaxWidth()]}
            >
              <ComposeText>Custom enter, default exit</ComposeText>
            </OutlinedButton>
          </Column>
        </Card>
      </LazyColumn>
    </Host>
  );
};

const handleToast = () => {
  toast.info('I am outside!');
};

export default ToastDemo;
