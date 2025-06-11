// client/src/components/common/MaskedInput.js
import React from 'react';
import { IMaskInput } from 'react-imask';

// Bu bileşen, react-imask'in özelliklerini MUI TextField'a aktarmak için bir aracıdır.
const MaskedInput = React.forwardRef(function MaskedInput(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      // Türkiye telefon formatı için maske: (5xx) xxx xx xx
      mask="(000) 000 00 00"
      definitions={{
        '#': /[1-9]/, // Bu maske için gerekli değil ama örnek olarak kalabilir
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

export default MaskedInput;