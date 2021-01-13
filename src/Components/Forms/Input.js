import React from 'react';
import styles from './Input.module.css';

const Input = ({
  label,
  type,
  name,
  value,
  onChange,
  error,
  onBlur,
  className,
}) => {
  return (
    <div className={styles.wrapper}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <div className={className}>
        <input
          id={name}
          name={name}
          className={styles.input}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Input;
