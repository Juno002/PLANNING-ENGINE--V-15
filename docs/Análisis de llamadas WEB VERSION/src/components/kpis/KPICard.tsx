type Props = {
  title: string;
  value: number | string;
};

export default function KPICard({ title, value }: Props) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
