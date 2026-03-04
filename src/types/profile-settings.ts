export type SettingToggleCardProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  saving: boolean;
  onToggle: () => void;
  enabledLabel: string;
  disabledLabel: string;
};
