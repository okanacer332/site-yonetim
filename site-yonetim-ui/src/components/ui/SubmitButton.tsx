import React from 'react';
import { Button, CircularProgress, ButtonProps } from '@mui/material';

// Standart Button proplarına ek olarak 'isLoading' prop'u ekliyoruz.
interface SubmitButtonProps extends ButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
}

function SubmitButton({ isLoading, children, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      // isLoading true ise butonu devre dışı bırak
      disabled={isLoading}
      {...props}
    >
      {/* isLoading true ise animasyon, değilse butonun normal yazısını göster */}
      {isLoading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
}

export default SubmitButton;
