type Props = { tournamentId?: string };

export default function CreateEvents({tournamentId} : Props){



    return (
      <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
        <div></div>
        <div className="p-8 w-full max-w-md">
          <h1 className="text-xl font-semibold mb-6">
            Create Events for tournament ID: {tournamentId}
          </h1>
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Event Type
            </label>

            <select
              name="eventType"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-800 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select an event type</option>
              <option value="1">Kumite</option>
              <option value="2">Kata</option>
              <option value="3">Kobudo</option>
            </select>
          </div>
        </div>
      </div>
    )
} 