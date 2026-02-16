import { getDojoList, getTournamentById } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";


type props = { tournamentId: number; };


const beltColors = [
  { id: 1, name: "White" },
  { id: 2, name: "Yellow" },
  { id: 3, name: "Orange" }, 
  { id: 4, name: "Green" },
  { id: 5, name: "Purple" },
  { id: 6, name: "Blue" },
  { id: 7, name: "Brown" },
  { id: 8, name: "Black" }
] as const;

export function CreateParticipant({ tournamentId }: props) {
  const { data, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => getTournamentById(tournamentId!),
    enabled: !!tournamentId,
  });

  const {data: dojoList} = useQuery({
    queryKey: ["dojos"],
    queryFn: () => getDojoList(),
  });

  const [dojoInput, setDojoInput] = useState("");

  console.log("selected dojo:", dojoInput || "none");

  const navigate = useNavigate();
  const isEdit = true;
  const handleNext = () => {
    // TODO, change this to handle save and proceed    
    if (tournamentId) {
      navigate({
        to: `/tournament/participant/register/$id/select-events`,
        params: { id: String(tournamentId) },
      });
    }
  };

  const handleBack = () => {
    console.log("Going back to participant dashboard");
    navigate({
      to: `/tournament/participant`,

    });
  };


  return (<div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
    <div className="p-8 w-full max-w-6xl">
      <h1 className="text-xl font-semibold mb-6">
        {isLoading ? "Loading..." : `Register for tournament : ${data.name}`}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Email
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter participant email"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Participant First Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Participant first name"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Participant Last Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter participant last name"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Participant age
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter participant age (as of tournament date)"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Belt Color
          </label>
          <select
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>
              Select belt color
            </option>
            {beltColors.map((belt) => (
              <option key={belt.name} value={belt.name}>
                {belt.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Dojo
          </label>
          <DojoAutocomplete
  dojoList={dojoList || []}
  value={dojoInput}
  onChange={setDojoInput}
/>
        </div>
      </div>

    </div>
    <div className="mt-8 flex gap-4 justify-center">
      <button
        onClick={handleBack}
        //disabled={true}
        className={`px-4 py-2 rounded 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
      >
        Back
      </button>


      <button
        onClick={handleNext}
        disabled={!isEdit}
        className={`px-4 py-2 rounded 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
      >
        Next
      </button>
    </div>
  </div>)
}




interface Dojo {
  id: number;
  name: string;
  city: string;
}

interface DojoAutocompleteProps {
  dojoList: Dojo[];
  value: string;
  onChange: (dojoName: string) => void;
  placeholder?: string;
  className?: string;
}

export const DojoAutocomplete: React.FC<DojoAutocompleteProps> = ({
  dojoList,
  value,
  onChange,
  placeholder = "Type dojo name or city",
  className = "",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredDojos =
    dojoList?.filter(
      (dojo) =>
        dojo.name.toLowerCase().includes(value.toLowerCase()) ||
        dojo.city.toLowerCase().includes(value.toLowerCase())
    ) || [];
    console.log("filtered dojos:", filteredDojos);
  function handleSelectDojo(dojo: Dojo) {
    onChange(dojo.name);
    setShowDropdown(false);
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && filteredDojos.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-auto">
          {filteredDojos.map((dojo) => (
            <li
              key={dojo.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-700"
              onMouseDown={() => handleSelectDojo(dojo)}
            >
              <span className="font-medium">{dojo.name}</span>
              <span className="ml-2 text-xs text-gray-400">{dojo.city}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};