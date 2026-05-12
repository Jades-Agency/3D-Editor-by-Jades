import ColorPicker from "@/components/editor/ColorPicker";

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorRow({ label, value, onChange }: ColorRowProps) {
  return <ColorPicker label={label} value={value} onChange={onChange} />;
}
