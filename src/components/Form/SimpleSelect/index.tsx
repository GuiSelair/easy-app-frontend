import React, { useRef, useEffect } from 'react';
import ReactSelect, {
  OptionTypeBase,
  Props as SelectProps,
} from 'react-select';
import { useField } from '@unform/core';

interface Props extends SelectProps<OptionTypeBase> {
  name: string;
  width?: number;
}

export default function SimpleSelect({ name, width, options, ...rest }: Props) {
  const selectRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef.current,
      setValue: (ref, value) => {
        ref.select.setValue(value);
      },
      clearValue: ref => {
        ref.select.select.clearValue();
      },
      getValue: (ref: any) => {
        if (rest.isMulti) {
          if (!ref.state.value) {
            return [];
          }
          return ref.state.value.map((option: OptionTypeBase) => option.value);
        }
        if (!ref.state.value) {
          return '';
        }
        return ref.state.value.value;
      },
    });
  }, [fieldName, registerField, rest.isMulti]);


  return (
    <ReactSelect
      style={{width}}
      defaultValue={
        defaultValue && options.find(option => option.value === defaultValue)
      }
      ref={selectRef}
      classNamePrefix="react-select"
      options={options}
      {...rest}
    />
  );
};