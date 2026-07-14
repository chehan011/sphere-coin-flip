type ResultCardProps = {
  coin: string;
  result: string;
};

export default function ResultCard({
  coin,
  result,
}: ResultCardProps) {
  if (!coin) return null;

  return (
    <div className="mt-6 bg-slate-800 rounded-lg p-4 text-center">
      <h3 className="text-lg font-bold">
        Coin landed on
      </h3>

      <p className="text-3xl mt-2 text-yellow-400">
        {coin}
      </p>

      <p className="mt-4 text-xl">
        {result}
      </p>
    </div>
  );
}