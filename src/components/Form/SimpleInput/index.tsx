import React, {
  useEffect,
  useRef,
  InputHTMLAttributes,
  useState,
  useCallback,
} from 'react';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import { useField } from '@unform/core';

import styles from './styles.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  type: string;
  width?: number;
}

const SimpleInput = ({
  name,
  type,
  width,
  ...rest
}: InputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { registerField, fieldName, defaultValue, error } = useField(name);
  const [modifiedType, setModifiedType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
    setModifiedType(type);
  }, [fieldName, registerField, type]);

  useEffect(() => {
    setModifiedType(showPassword ? 'text' : 'password');
  }, [showPassword]);


  const handleAlterTypePassword = useCallback(() => {
    setShowPassword(oldState => !oldState);
  }, []);

  return (
    <div className={styles.container} style={{width}}>
      <input
        ref={inputRef}
        type={type !== 'password' ? type : modifiedType}
        defaultValue={defaultValue}
        style={{width}}
        {...rest}
      />
      {type === 'password' &&
        (!showPassword ? (
          <FaEyeSlash
            size={16}
            color="black"
            onClick={handleAlterTypePassword}
          />
        ) : (
          <FaEye size={16} color="black" onClick={handleAlterTypePassword} />
        ))}
    </div>
  );
};

export default SimpleInput;