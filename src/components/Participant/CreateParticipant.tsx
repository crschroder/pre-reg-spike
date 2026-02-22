import { createRegistration, getDojoList, getParticipantById, getTournamentById, getTournamentEvents } from "@/api/tournaments";
import { CreateRegistrationPayload, EventSelection } from "@shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { set } from "date-fns";
import { on } from "events";
import { useEffect, useRef, useState } from "react";


type props = { tournamentId: number; 
  participantId?: number | undefined
 };


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

export function CreateParticipant({ tournamentId, participantId }: props) {
  const { data, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => getTournamentById(tournamentId!),
    enabled: !!tournamentId,
  });
  console.log("TournamentID:", tournamentId);
  // State for form data
  const [formData, setFormData] = useState<CreateRegistrationPayload>({
  email: "",
  participant: {
    firstName: "",
    lastName: "",
    age: 0,
    genderId: 0,
    beltRankId: 0,
    notes: "",
    dojoId: 0,
    otherDojoName: "",
    paid: false,
    checkedIn: false,
  },
  events: [],
});

  const isEdit = Boolean(participantId);
  

  const {data: dojoList} = useQuery({
    queryKey: ["dojos"],
    queryFn: () => getDojoList(),
  });

  const {data: eventTypes} = useQuery({
    queryKey: ["eventTypes", tournamentId],
    queryFn: () => getTournamentEvents(tournamentId),
    enabled: !!tournamentId,
  });

  const mappedEvents = (eventTypes ?? []).map((item: any) => ({
  id: item.id,
  EventId: item.eventId,
  Name: item.event?.name ?? "",
}));

  const [dojoInput, setDojoInput] = useState("");

  const { data: participantData, isLoading: isLoadingParticipant } = useQuery({
    queryKey: ["participant", participantId],
    queryFn: () => getParticipantById(participantId!),
    enabled: isEdit, // only fetch when editing
  });



  const [dojoValue, setDojoValue] = useState<{ id: number | null; freeText?: string }>({ id: null });

  // State for selected events
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  const [savedMessage, setSavedMessage] = useState("");
  const mutation = useMutation({
    mutationFn: (newRegistration: CreateRegistrationPayload) =>
      createRegistration(tournamentId, newRegistration),
    onSuccess: () => {
      setSavedMessage("Data has been saved.");
      // Invalidate and refetch registrations after successful creation
      //queryClient.invalidateQueries({ queryKey: ["registrations", tournamentId] });
      //navigate(`/tournament/${tournamentId}/participants`);
      setTimeout(() => setSavedMessage(""), 3000);
    }
  });

  useEffect(() => {
  setFormData(prev => ({
    ...prev,
    events: selectedEvents
  } as CreateRegistrationPayload));
}, [selectedEvents]);

// prefill form when participant data is loaded for editing
useEffect(() => {
  if (participantData) {
   
    setFormData({
      email: participantData.email || "",
      participant: {
        firstName: participantData.participant.firstName,
        lastName: participantData.participant.lastName,
        age: participantData.participant.age,
        genderId: participantData.participant.genderId,
        beltRankId: participantData.participant.beltRankId,
        notes: participantData.participant.notes,
        dojoId: participantData.participant.dojoId,
        otherDojoName: participantData.participant.otherDojoName,
        paid: participantData.participant.paid,
        checkedIn: participantData.participant.checkedIn,
      },
      events: participantData.events.map((e) => e.eventId) || [],
    });    
    if (participantData.participant.dojoId) {
      
      const dojo = dojoList?.find(d => d.id === participantData.participant.dojoId);
      if (dojo) {
        setDojoValue({ id: dojo.id });
      } else if (participantData.participant.otherDojoName) {
        setDojoValue({ id: 18, freeText: participantData.participant.otherDojoName });
      }
    }
    if(participantData.events) {
      debugger;
      console.log("Participant events:", participantData.events);
      // const eventIds = mappedEvents
      //   .filter(e => participantData.events.some((pe: EventSelection) => pe.eventId === e.EventId))
      //   .map(e => e.EventId);
      // setSelectedEvents(eventIds);
    }
  }
}, [participantData, dojoList]);

 

  const navigate = useNavigate();
  
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
    
    navigate({
      to: `/tournament/participant`,

    });
  };

  const onSubmit  = () => {
    setSavedMessage("Saving data...");
    mutation.mutate(formData!, {
      onSuccess: () => {
       
      }
    }); 
  }


  return (<div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
    {savedMessage && (
      <div className="mb-4 p-3 bg-green-700 text-white rounded shadow text-center">
        {savedMessage}
      </div>
    )}
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
            value={formData?.email}
            placeholder="Enter participant email"
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value } as CreateRegistrationPayload))}  
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
            value={formData?.participant.firstName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              participant: {
                ...prev?.participant,
                firstName: e.target.value
              }
            } as CreateRegistrationPayload))} 
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
            value={formData?.participant.lastName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              participant: {
                ...prev?.participant,
                lastName: e.target.value
              }
            } as CreateRegistrationPayload))}  
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
            value={formData.participant.age === 0 ? "" : formData.participant.age}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              participant: {
                ...prev?.participant,
                age: Number(e.target.value)
              }
            } as CreateRegistrationPayload))}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Belt Color
          </label>
          <select
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
            value={formData?.participant.beltRankId==0 ? "" : formData?.participant.beltRankId  }
            onChange={(e) =>
                setFormData(prev => ({
              ...prev,
              participant: {
                ...prev?.participant,
                beltRankId: e.target.value ? Number(e.target.value) : undefined
              }
            } as CreateRegistrationPayload))}
          >
            <option value="" disabled>
              Select belt color 
            </option>
            {beltColors.map((belt) => (
              <option key={belt.name} value={belt.id} >
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
          value={dojoValue}
          onChange={(value) => {
            setDojoValue(value);
            setFormData(prev => ({
              ...prev,
              participant: {
                ...prev?.participant,
                dojoId: value?.id || null,
                otherDojoName: value.id === 18 ? value.freeText : undefined
              }
            } as CreateRegistrationPayload));
          }}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Gender
          </label>
          <div className="flex items-center gap-6 mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value={1}
                checked={formData.participant.genderId === 1}
                onChange ={(e) => {
                
                  setFormData(prev => ({
                  ...prev,
                  participant: {
                    ...prev?.participant,
                    genderId: Number(e.target.value)
                  }
                } as CreateRegistrationPayload))}}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-200">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value={2}
                onChange ={(e) => {
                  
                  setFormData(prev => ({
                  ...prev,
                  participant: {
                    ...prev?.participant,
                    genderId: Number(e.target.value)
                  }
                } as CreateRegistrationPayload))}}
                className="form-radio text-pink-600"
              />
              <span className="ml-2 text-gray-200">Female</span>
            </label>
          </div>
        </div>
        {/* Events field in the same column as First Name and Belt Color */}
        <div className="col-span-1">
          {mappedEvents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1 mt-4">
                Events
              </label>
              <div className="flex flex-col gap-2 mt-1">
                {mappedEvents.map(event => (
                  <label key={event.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={event.Name}
                      checked={selectedEvents.includes(event.Name)}
                      onChange={e => {
                        setSelectedEvents(prev =>
                          e.target.checked
                            ? [...prev, event.Name]
                            : prev.filter(name => name !== event.Name)
                        );
                      }}
                      className="form-checkbox text-green-500"
                    />
                    <span className="ml-2 text-gray-200">{event.Name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
    <div className="mt-8 flex gap-4 justify-center">
      <button
        onClick={onSubmit}
        disabled={mutation.isPending}
        className={`px-4 py-2 rounded 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
      >
        Submit
      </button>



      {/* <button
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
      </button> */}
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
   value: { id: number | null; freeText?: string };
  onChange: (value: { id: number | null; freeText?: string }) => void;  
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
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  console.log("DojoAutocomplete value:", value);
   const filteredDojos =
    dojoList.filter(
      (dojo) =>
        dojo.name.toLowerCase().includes(input.toLowerCase()) ||
        dojo.city.toLowerCase().includes(input.toLowerCase())
    ) || [];
    
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
  if (highlighted >= 0 && itemRefs.current[highlighted]) {
    itemRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
  }
}, [highlighted]);

  function handleSelectDojo(dojo: Dojo) {
    setInput(dojo.name);
    setShowDropdown(false);
    if (dojo.id === 18) {
      onChange({ id: 18, freeText: "" });
    } else {
      onChange({ id: dojo.id });
    }
  }

  function handleFreeTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ id: 18, freeText: e.target.value });
  }

  useEffect(() => {
    if (value.id === 18 && value.freeText !== undefined) {
      setInput("Other");
    } else if (value.id) {
      const dojo = dojoList.find((d) => d.id === value.id);
      if (dojo) setInput(dojo.name);
    }
  }, [value, dojoList]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setShowDropdown(true);
      setHighlighted(0);
      return;
    }
    if (!filteredDojos.length) return;

    if (e.key === "ArrowDown") {
      setHighlighted((prev) => (prev + 1) % filteredDojos.length);
    } else if (e.key === "ArrowUp") {
      setHighlighted((prev) => (prev - 1 + filteredDojos.length) % filteredDojos.length);
    } else if (e.key === "Enter" && highlighted >= 0) {
      handleSelectDojo(filteredDojos[highlighted]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }  

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => {
          setInput(e.target.value);
          setShowDropdown(true);
          setHighlighted(-1);
        }}
        onFocus={() => setShowDropdown(true)}
         onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        autoComplete="do-not-auto-fill"
      />
      {showDropdown && filteredDojos.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-auto">
          {filteredDojos.map((dojo, idx) => (
            <li
              key={dojo.id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-700 ${highlighted === idx ? "bg-gray-700" : ""}`}
              onMouseDown={() => handleSelectDojo(dojo)}
               onMouseEnter={() => setHighlighted(idx)}
               ref={el => { itemRefs.current[idx] = el; }}               
            >
              <span className="font-medium">{dojo.name}</span>
              <span className="ml-2 text-xs text-gray-400">{dojo.city}</span>
            </li>
          ))}
        </ul>
      )}
      {/* Show free text input if 'Other' is selected */}
      {value.id === 18 && (
        <input
          type="text"
          value={value.freeText || ""}
          onChange={handleFreeTextChange}
          className="mt-2 w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter dojo name"
        />
      )}
    </div>
  );
};