// src/components/Input.tsx

import React from "react";

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
};

export function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: InputProps) {
  return (
    <div>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#000073",
          marginBottom: 8,
          display: "block",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl"
        style={{
          border: error ? "1.5px solid #DC2626" : "1.5px solid #DBEAFE",
          fontSize: 14,
          outline: "none",
          fontFamily: "'Poppins', sans-serif",
        }}
      />

      {error && (
        <p
          style={{
            color: "#DC2626",
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}