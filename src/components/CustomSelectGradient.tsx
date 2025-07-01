import Select from 'react-select';
import type { StylesConfig, SingleValue } from 'react-select';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectGradientProps {
  options: Option[];
  value: Option | null;
  onChange: (value: Option) => void;
  className?: string;
}

const customStyles: StylesConfig<Option, false> = {
  control: (base) => ({
    ...base,
    background: 'linear-gradient(135deg, #ff3366 0%, #ff6b99 100%)',
    borderRadius: '10px',
    border: 'none',
    padding: '6px 12px',
    color: 'white',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: "'Open Sans', sans-serif",
    minHeight: '40px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: "'Open Sans', sans-serif",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#a42545',
    borderRadius: '0 0 8px 8px',
    marginTop: -4,
    fontFamily: "'Open Sans', sans-serif",
    scrollbarWidth: 'thin',
    scrollbarColor: '#ff6b99 #7a1f3c',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#ff749f' : '#a42545',
    color: state.isFocused ? 'black' : 'white',
    padding: 10,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'white',
    padding: 4,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
};

const CustomSelectGradient = ({
  options,
  value,
  onChange,
  className,
}: CustomSelectGradientProps) => {
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
      className={className}
    />
  );
};

export default CustomSelectGradient;
