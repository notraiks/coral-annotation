import Button from '../common/Button.jsx';

const LABELS = [
  { key: 'LC', text: 'Living Coral (LC)', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { key: 'PB', text: 'Partially Bleached (PB)', color: 'bg-amber-400 hover:bg-amber-500 text-slate-900' },
  { key: 'DC', text: 'Dead Coral (DC)', color: 'bg-red-500 hover:bg-red-600' },
  { key: 'DCA', text: 'Dead Coral with Algae (DCA)', color: 'bg-violet-500 hover:bg-violet-600' },
];

function LabelButtons({ disabled = false, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {LABELS.map((label) => (
        <Button
          key={label.key}
          size="lg"
          className={`${label.color} w-full justify-center`}
          disabled={disabled}
          onClick={() => onSelect && onSelect(label.key)}
        >
          {label.text}
        </Button>
      ))}
    </div>
  );
}

export default LabelButtons;
