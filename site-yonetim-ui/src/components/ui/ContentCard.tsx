import React from 'react';
import { Paper, Typography, Box, StackProps, Stack, PaperProps } from '@mui/material';

// Bileşenin alacağı propları daha doğru tanımlıyoruz.
// Artık PaperProps'u temel alıyor ve Stack için gerekli olanları ayrıca belirtiyoruz.
interface ContentCardProps extends PaperProps {
  title?: string;
  children: React.ReactNode;
  actionComponent?: React.ReactNode;
  // İçerideki Stack bileşeninin 'spacing' özelliğini kontrol etmek için
  spacing?: StackProps['spacing'];
}

function ContentCard({ title, children, actionComponent, spacing = 3, ...props }: ContentCardProps) {
  return (
    // {...props} artık güvenli bir şekilde sadece Paper'a ait özellikleri içeriyor.
    <Paper sx={{ p: 3 }} {...props}>
      {/* Stack bileşenine 'spacing' özelliğini ayrıca veriyoruz. */}
      <Stack spacing={spacing}>
        {/* Eğer bir başlık varsa, başlık ve aksiyon butonunu gösteren bir alan oluştur */}
        {title && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{title}</Typography>
            {actionComponent}
          </Box>
        )}
        {/* Kartın ana içeriği */}
        {children}
      </Stack>
    </Paper>
  );
}

export default ContentCard;
