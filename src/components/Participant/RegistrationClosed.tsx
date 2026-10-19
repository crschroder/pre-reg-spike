type RegistrationClosedProps = {
  tournamentName?: string;
};

export function RegistrationClosed({ tournamentName }: RegistrationClosedProps) {
  const message = tournamentName
    ? `The pre-registration period for ${tournamentName} tournament has ended. But you can register on the day of the tournament.`
    : "The pre-registration period for this tournament has ended. But you can register on the day of the tournament.";

  return (
    <div className="min-h-screen bg-gray-900 px-6 pb-6 pt-4 text-white flex flex-col items-center justify-start">
      <div className="mt-4 max-w-2xl rounded-lg border border-gray-700 bg-gray-800 p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-white">Pre-registration is Closed</h1>
        <p className="mt-4 text-lg text-gray-300">{message}</p>
      </div>
    </div>
  );
}

export default RegistrationClosed;