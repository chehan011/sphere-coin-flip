type WalletCardProps = {
  balance: number;
};

export default function WalletCard({
  balance,
}: WalletCardProps) {
  return (
    <>
      <button className="w-full bg-blue-600 rounded-lg py-3 font-semibold">
        Connect Wallet
      </button>

      <div className="mt-6 bg-slate-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">
          Balance
        </p>

        <h2 className="text-2xl font-bold">
          {balance} Test UCT
        </h2>
      </div>
    </>
  );
}