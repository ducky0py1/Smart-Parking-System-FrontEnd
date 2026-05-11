import Badge from './Badge';

const STATUS_MAP = {
  free:     { color: 'green', label: 'LIBRE',    dot: '●' },
  reserved: { color: 'amber', label: 'RÉSERVÉ',  dot: '◐' },
  occupied: { color: 'red',   label: 'OCCUPÉ',   dot: '●' },
};

export default function StatusTag({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.free;
  return (
    <Badge color={config.color}>
      <span className="blink">{config.dot}</span>
      {config.label}
    </Badge>
  );
}
