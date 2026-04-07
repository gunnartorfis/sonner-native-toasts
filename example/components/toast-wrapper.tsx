import * as React from 'react';
import { Pressable, View } from 'react-native';
import { toast } from 'sonner-native';
import '../global.css';

export const ToastWrapper: React.ComponentType<
  React.ComponentProps<typeof View> & {
    children: React.ReactNode;
    toastId: string | number;
  }
> = ({ toastId, style, ...props }) => {
  return (
    <Pressable
      style={[style, { backgroundColor: 'red' }]}
      onPress={() => toast.dismiss(toastId)}
      {...props}
    />
  );
};
