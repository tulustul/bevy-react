export type RadioValue = string | number;

export type RadioOption<T extends RadioValue = any> = {
  label: string;
  value: T;
};

export type RadioProps<T extends RadioValue = any> = {
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
};

export function Radio({ options, value, onChange }: RadioProps) {
  function onClick(option: RadioOption) {
    if (option.value !== value) {
      onChange(option.value);
    }
  }

  return (
    <node style={{ gap: 8 }}>
      {options.map((option, index) => (
        <Option
          key={index}
          option={option}
          selected={value}
          onClick={() => onClick(option)}
        />
      ))}
    </node>
  );
}

type OptionProps = {
  option: RadioOption;
  selected: RadioValue;
  onClick: () => void;
};

function Option({ option, selected, onClick }: OptionProps) {
  return (
    <button onClick={onClick}>
      <text>{option.label}</text>
    </button>
  );
}
