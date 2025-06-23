import Select from 'react-select';
import type { StylesConfig, SingleValue } from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectGreyProps {
  options: Option[];
  value: Option;
  onChange: (value: Option) => void;
}

const customStyles: StylesConfig<Option, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: '#434040',
    borderRadius: '6px',
    border: 'none',
    padding: '6px 12px',
    color: 'white',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'all 0.9s ease',
    fontFamily: "'Open Sans', sans-serif",
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#363636',
    borderRadius: '0 0 6px 6px',
    overflow: 'hidden',
    marginTop: -4,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'white' : '#363636',
    color: state.isFocused ? 'black' : 'white',
    padding: 10,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '4px', // 👈 Робить опцію вужчою
    borderRadius: '6px', // 👈 Закруглення країв
    width: 'calc(100% - 8px)', // 👈 Компенсація margin для збереження розміру
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'white',
    padding: 4,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
};

const CustomSelectGrey = ({
  options,
  value,
  onChange,
}: CustomSelectGreyProps) => {
  const handleChange = (newValue: SingleValue<Option>) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      isSearchable={false}
    />
  );
};

export default CustomSelectGrey;
