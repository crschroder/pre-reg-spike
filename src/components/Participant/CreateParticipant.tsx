import {
  createRegistration,
  getDojoList,
  getParticipantById,
  getTournamentById,
  getTournamentEvents,
  updateParticipant,
} from "@/api/tournaments";
import { CreateRegistrationPayload, EventSelection, ParticipantUpdatePayload } from "@shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { safeParse } from "valibot";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { ParticipantEmailSchema } from "../../../validations";
import { normalizeName } from "@/helpers/stringHelpers";

type Props = {
  tournamentId: number;
  participantId?: number | undefined;
  mode?: "organizer";
};

type FieldName =
  | "email"
  | "firstName"
  | "lastName"
  | "age"
  | "beltRankId"
  | "dojo"
  | "genderId"
  | "events";

type FieldErrors = Partial<Record<FieldName, string>>;
type TouchedFields = Partial<Record<FieldName, boolean>>;

const OTHER_DOJO_ID = 18;
const labelClassName = "block text-sm font-medium text-gray-200 mb-1";
const baseInputClassName =
  "w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2";

const beltColors = [
  { id: 1, name: "White" },
  { id: 2, name: "Yellow" },
  { id: 3, name: "Orange" },
  { id: 4, name: "Green" },
  { id: 5, name: "Purple" },
  { id: 6, name: "Blue" },
  { id: 7, name: "Brown" },
  { id: 8, name: "Black" },
] as const;

function formatAgeRange(minAge?: number, maxAge?: number) {
  if (typeof minAge === "number" && typeof maxAge === "number") {
    return `(${minAge}-${maxAge})`;
  }

  if (typeof minAge === "number") {
    return `(min ${minAge})`;
  }

  if (typeof maxAge === "number") {
    return `(max ${maxAge})`;
  }

  return "";
}

function formatRegisteredEventLine(event: NonNullable<CreateRegistrationPayload["registeredEvents"]>[number]) {
  const eventCode = event.eventCode?.trim() || "Unknown";
  const ageRange = formatAgeRange(event.minAge, event.maxAge);
  const parts = [
    `${normalizeName(eventCode)} - ${normalizeName(event.eventType)} ${normalizeName(event.divisionDisplayName)}`,
    ageRange,
    normalizeName(event.eventRank),
    'Belt',
    event.genderDisplayName,
  ].filter(Boolean);

  return parts.join(" ");
}

function normalizeFormData(
  formData: CreateRegistrationPayload,
  selectedEvents: EventSelection[]
): CreateRegistrationPayload {
  return {
    ...formData,
    email: formData.email.trim(),
    participant: {
      ...formData.participant,
      firstName: formData.participant.firstName.trim(),
      lastName: formData.participant.lastName.trim(),
      notes: formData.participant.notes?.trim() ?? "",
      otherDojoName: formData.participant.otherDojoName?.trim() ?? "",
      dojoId: formData.participant.dojoId ?? 0,
    },
    events: selectedEvents,
  };
}

function validateParticipantForm(
  formData: CreateRegistrationPayload,
  dojoValue: { id: number | null; freeText?: string }
): FieldErrors {
  const errors: FieldErrors = {};

  const emailResult = safeParse(ParticipantEmailSchema, formData.email);
  if (!emailResult.success) {
    errors.email = emailResult.issues[0]?.message ?? "Email must be a valid email address";
  }

  if (!formData.participant.firstName) {
    errors.firstName = "Participant first name is required";
  }

  if (!formData.participant.lastName) {
    errors.lastName = "Participant last name is required";
  }

  if (!Number.isFinite(formData.participant.age) || formData.participant.age <= 0) {
    errors.age = "Participant age is required";
  }

  if (!formData.participant.beltRankId || formData.participant.beltRankId <= 0) {
    errors.beltRankId = "Belt color is required";
  }

  if (!formData.participant.genderId || formData.participant.genderId <= 0) {
    errors.genderId = "Gender is required";
  }

  if (dojoValue.id === OTHER_DOJO_ID) {
    if (!formData.participant.otherDojoName) {
      errors.dojo = "Dojo name is required";
    }
  } else if (!dojoValue.id || dojoValue.id <= 0) {
    errors.dojo = "Dojo is required";
  }

  if (formData.events.length === 0) {
    errors.events = "Select at least one event";
  }

  return errors;
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <label className={labelClassName}>
      {children}
      <span className="ml-1 text-red-400">*</span>
    </label>
  );
}

function ValidationMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-400">{message}</p>;
}

export function CreateParticipant({ tournamentId, participantId, mode }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(participantId);

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
  const [dirtyList, setDirtyList] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<EventSelection[]>([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [dojoValue, setDojoValue] = useState<{ id: number | null; freeText?: string }>({ id: null });

  const { data, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => getTournamentById(tournamentId),
    enabled: !!tournamentId,
  });

  const { data: dojoList } = useQuery({
    queryKey: ["dojos"],
    queryFn: () => getDojoList(),
  });

  const { data: eventTypes } = useQuery({
    queryKey: ["eventTypes", tournamentId],
    queryFn: () => getTournamentEvents(tournamentId),
    enabled: !!tournamentId,
  });

  const { data: participantData, isLoading: isLoadingParticipant } = useQuery({
    queryKey: ["participant", participantId],
    queryFn: () => getParticipantById(participantId!),
    enabled: isEdit,
  });

  if (!isLoadingParticipant) {
    console.log("Fetched participant data:", participantData);
  }


  const mappedEvents = (eventTypes ?? []).map((item: any) => ({
    id: item.id,
    eventId: item.eventId,
    name: item.event?.name ?? "",
  }));

  const markDirty = (fieldName: string) => {
    setDirtyList((prev) => (prev.includes(fieldName) ? prev : [...prev, fieldName]));
  };

  const markTouched = (fieldName: FieldName) => {
    setTouchedFields((prev) => (prev[fieldName] ? prev : { ...prev, [fieldName]: true }));
  };

  const getUpdatePayload = (payloadSource: CreateRegistrationPayload): ParticipantUpdatePayload => {
    const payload: ParticipantUpdatePayload = {};

    if (dirtyList.includes("email")) {
      payload.email = payloadSource.email;
    }
    if (dirtyList.includes("firstName")) {
      payload.firstName = payloadSource.participant.firstName;
    }
    if (dirtyList.includes("lastName")) {
      payload.lastName = payloadSource.participant.lastName;
    }
    if (dirtyList.includes("age")) {
      payload.age = payloadSource.participant.age;
    }
    if (dirtyList.includes("genderId")) {
      payload.genderId = payloadSource.participant.genderId;
    }
    if (dirtyList.includes("beltRankId")) {
      payload.beltRankId = payloadSource.participant.beltRankId;
    }
    if (dirtyList.includes("dojoId") || dirtyList.includes("otherDojoName")) {
      payload.dojoId = payloadSource.participant.dojoId;
      payload.otherDojoName = payloadSource.participant.otherDojoName;
    }
    if (dirtyList.includes("events")) {
      payload.events = payloadSource.events;
    }

    return payload;
  };

  const mutation = useMutation({
    mutationFn: (registrationPayload: CreateRegistrationPayload) =>
      isEdit
        ? updateParticipant(participantId!, getUpdatePayload(registrationPayload))
        : createRegistration(tournamentId, registrationPayload),
    onSuccess: async (result) => {
      setSavedMessage("Data has been saved.");
      await queryClient.invalidateQueries({ queryKey: ["participant-summary", tournamentId] });
      if (isEdit) {
        await queryClient.invalidateQueries({ queryKey: ["participant", participantId] });
      }
      window.setTimeout(() => setSavedMessage(""), 3000);

      if (!isEdit) {
        navigate({
          to: `/tournament/participant/register/${tournamentId}/update-participant/${result.participant.id}`,
          search: { mode },
        });
      }
    },
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      events: selectedEvents,
    }));
  }, [selectedEvents]);

  useEffect(() => {
    if (!participantData) {
      return;
    }

    setFormData({
      email: participantData.email || "",
      participant: {
        firstName: participantData.participant.firstName,
        lastName: participantData.participant.lastName,
        age: participantData.participant.age,
        genderId: participantData.participant.genderId,
        beltRankId: participantData.participant.beltRankId,
        notes: participantData.participant.notes || "",
        dojoId: participantData.participant.dojoId || 0,
        otherDojoName: participantData.participant.otherDojoName || "",
        paid: participantData.participant.paid,
        checkedIn: participantData.participant.checkedIn,
      },
      events: participantData.events || [],
    });

    if (participantData.participant.dojoId) {
      const dojo = dojoList?.find((item) => item.id === participantData.participant.dojoId);
      if (dojo) {
        setDojoValue({ id: dojo.id });
      } else if (participantData.participant.otherDojoName) {
        setDojoValue({ id: OTHER_DOJO_ID, freeText: participantData.participant.otherDojoName });
      }
    } else {
      setDojoValue({ id: null });
    }

    if (participantData.events) {
      const eventNames = (eventTypes ?? [])
        .map((item: any) => item.event?.name?.toLowerCase())
        .filter(Boolean)
        .filter((name: string) =>
          participantData.events.some((selection: EventSelection) => selection === name)
        ) as EventSelection[];

      setSelectedEvents(eventNames);
    }
  }, [dojoList, eventTypes, participantData]);

  const normalizedFormData = normalizeFormData(formData, selectedEvents);
  const fieldErrors = validateParticipantForm(normalizedFormData, dojoValue);
  const isFormValid = Object.keys(fieldErrors).length === 0;
  const isSubmitDisabled = mutation.isPending || !isFormValid;
  const isFormLoading = isLoading || (isEdit && isLoadingParticipant);

  const registeredEvents = participantData?.registeredEvents ?? [];

  const shouldShowError = (fieldName: FieldName) =>
    Boolean((submitAttempted || touchedFields[fieldName]) && fieldErrors[fieldName]);

  const getInputClassName = (fieldName: FieldName) =>
    `${baseInputClassName} ${
      shouldShowError(fieldName)
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-600 focus:ring-blue-500"
    }`;

  const onSubmit = () => {
    setSubmitAttempted(true);

    if (!isFormValid) {
      return;
    }

    setSavedMessage("Saving data...");
    mutation.mutate(normalizedFormData);
  };

  const onCreateNewRegistration = () => {
    navigate({
      to: `/tournament/participant/register/${tournamentId}/create-participant`,
      search: { mode },
    });
  };

  const onBackToParticipants = () => {
    navigate({
      to: `/tournament/organizer/manage-registrants/${tournamentId}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 pb-24 md:pb-6 text-white flex flex-col items-center">
      {savedMessage && (
        <div className="mb-4 p-3 bg-green-700 text-white rounded shadow text-center">
          {savedMessage}
        </div>
      )}
      <div className="p-8 w-full max-w-6xl">
        {mode === "organizer" && (
          <div className="mb-4">
            <button
              onClick={onBackToParticipants}
              className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Back to Participants
            </button>
          </div>
        )}
        <h1 className={`text-xl font-semibold ${isEdit ? "mb-2" : "mb-6"}`}>
          {isFormLoading
            ? "Loading..."
            : isEdit
              ? `Registered for ${data?.name ?? ""}`
              : `Register for tournament: ${data?.name ?? ""}`}
        </h1>
        {isEdit && (
          <div className="md:hidden mb-6 text-xs text-gray-400">
            Actions are in the bar at the bottom. Scroll down to review Events Registered.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <RequiredLabel>Email</RequiredLabel>
            <input
              type="text"
              name="email"
              className={getInputClassName("email")}
              value={formData.email}
              placeholder="Enter participant email"
              aria-invalid={shouldShowError("email")}
              onBlur={() => markTouched("email")}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, email: event.target.value }));
                markDirty("email");
              }}
            />
            <ValidationMessage message={shouldShowError("email") ? fieldErrors.email : undefined} />
          </div>

          <div className="col-span-1">
            <RequiredLabel>Participant First Name</RequiredLabel>
            <input
              type="text"
              className={getInputClassName("firstName")}
              placeholder="Participant first name"
              value={formData.participant.firstName}
              name="firstName"
              aria-invalid={shouldShowError("firstName")}
              onBlur={() => markTouched("firstName")}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  participant: {
                    ...prev.participant,
                    firstName: event.target.value,
                  },
                }));
                markDirty("firstName");
              }}
            />
            <ValidationMessage
              message={shouldShowError("firstName") ? fieldErrors.firstName : undefined}
            />
          </div>

          <div className="col-span-1">
            <RequiredLabel>Participant Last Name</RequiredLabel>
            <input
              type="text"
              className={getInputClassName("lastName")}
              placeholder="Enter participant last name"
              name="lastName"
              value={formData.participant.lastName}
              aria-invalid={shouldShowError("lastName")}
              onBlur={() => markTouched("lastName")}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  participant: {
                    ...prev.participant,
                    lastName: event.target.value,
                  },
                }));
                markDirty("lastName");
              }}
            />
            <ValidationMessage
              message={shouldShowError("lastName") ? fieldErrors.lastName : undefined}
            />
          </div>

          <div className="col-span-1">
            <RequiredLabel>Participant Age</RequiredLabel>
            <input
              type="number"
              name="age"
              className={getInputClassName("age")}
              placeholder="Enter participant age (as of tournament date)"
              value={formData.participant.age === 0 ? "" : formData.participant.age}
              aria-invalid={shouldShowError("age")}
              onBlur={() => markTouched("age")}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  participant: {
                    ...prev.participant,
                    age: event.target.value ? Number(event.target.value) : 0,
                  },
                }));
                markDirty("age");
              }}
            />
            <ValidationMessage message={shouldShowError("age") ? fieldErrors.age : undefined} />
          </div>

          <div className="col-span-1">
            <RequiredLabel>Belt Color</RequiredLabel>
            <select
              className={getInputClassName("beltRankId")}
              name="beltRankId"
              value={formData.participant.beltRankId === 0 ? "" : formData.participant.beltRankId}
              aria-invalid={shouldShowError("beltRankId")}
              onBlur={() => markTouched("beltRankId")}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  participant: {
                    ...prev.participant,
                    beltRankId: event.target.value ? Number(event.target.value) : 0,
                  },
                }));
                markDirty("beltRankId");
              }}
            >
              <option value="" disabled>
                Select belt color
              </option>
              {beltColors.map((belt) => (
                <option key={belt.name} value={belt.id}>
                  {belt.name}
                </option>
              ))}
            </select>
            <ValidationMessage
              message={shouldShowError("beltRankId") ? fieldErrors.beltRankId : undefined}
            />
          </div>

          <div className="col-span-1">
            <RequiredLabel>Dojo</RequiredLabel>
            <DojoAutocomplete
              dojoList={dojoList || []}
              value={dojoValue}
              invalid={shouldShowError("dojo")}
              onBlur={() => markTouched("dojo")}
              onChange={(value) => {
                setDojoValue(value);
                setFormData((prev) => ({
                  ...prev,
                  participant: {
                    ...prev.participant,
                    dojoId: value.id ?? 0,
                    otherDojoName: value.id === OTHER_DOJO_ID ? value.freeText ?? "" : "",
                  },
                }));
                markDirty("dojoId");
                markDirty("otherDojoName");
              }}
            />
            <ValidationMessage message={shouldShowError("dojo") ? fieldErrors.dojo : undefined} />
          </div>

          <div className="col-span-1">
            <RequiredLabel>Gender</RequiredLabel>
            <div
              className={`flex items-center gap-6 mt-2 rounded-md border px-3 py-3 ${
                shouldShowError("genderId") ? "border-red-500" : "border-gray-700"
              }`}
            >
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={1}
                  checked={formData.participant.genderId === 1}
                  aria-invalid={shouldShowError("genderId")}
                  onBlur={() => markTouched("genderId")}
                  onChange={(event) => {
                    setFormData((prev) => ({
                      ...prev,
                      participant: {
                        ...prev.participant,
                        genderId: Number(event.target.value),
                      },
                    }));
                    markDirty("genderId");
                  }}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-gray-200">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={2}
                  checked={formData.participant.genderId === 2}
                  aria-invalid={shouldShowError("genderId")}
                  onBlur={() => markTouched("genderId")}
                  onChange={(event) => {
                    setFormData((prev) => ({
                      ...prev,
                      participant: {
                        ...prev.participant,
                        genderId: Number(event.target.value),
                      },
                    }));
                    markDirty("genderId");
                  }}
                  className="form-radio text-pink-600"
                />
                <span className="ml-2 text-gray-200">Female</span>
              </label>
            </div>
            <ValidationMessage
              message={shouldShowError("genderId") ? fieldErrors.genderId : undefined}
            />
          </div>

          <div className="col-span-1">
            {mappedEvents.length > 0 && (
              <div>
                <RequiredLabel>Events</RequiredLabel>
                <div
                  className={`flex flex-col gap-2 mt-1 rounded-md border px-3 py-3 ${
                    shouldShowError("events") ? "border-red-500" : "border-gray-700"
                  }`}
                >
                  {mappedEvents.map((event) => (
                    <label key={event.id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={event.name.toLowerCase()}
                        name="events"
                        checked={selectedEvents.includes(event.name.toLowerCase())}
                        aria-invalid={shouldShowError("events")}
                        onBlur={() => markTouched("events")}
                        onChange={(eventChange) => {
                          const eventValue = eventChange.target.value as EventSelection;
                          setSelectedEvents((prev) =>
                            eventChange.target.checked
                              ? [...prev, eventValue]
                              : prev.filter((name) => name !== eventValue)
                          );
                          markDirty("events");
                        }}
                        className="form-checkbox text-green-500"
                      />
                      <span className="ml-2 text-gray-200">{event.name}</span>
                    </label>
                  ))}
                </div>
                <ValidationMessage
                  message={shouldShowError("events") ? fieldErrors.events : undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 hidden md:flex gap-4 justify-center">
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className={`px-4 py-2 rounded focus:outline-none focus:ring-2 ${
            isSubmitDisabled
              ? "bg-gray-600 text-gray-300 cursor-not-allowed focus:ring-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400"
          }`}
        >
          {isEdit ? "Update" : "Submit"}
        </button>
        {isEdit && (
          <button
            onClick={onCreateNewRegistration}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Create New Registration
          </button>
        )}
      </div>

      {isEdit && (
        <div className="mt-8 w-full max-w-6xl">
          <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
            <div className="mb-2 text-sm font-medium text-gray-200">Events Registered</div>
            {isLoadingParticipant ? (
              <div className="text-xs text-gray-400">Loading events...</div>
            ) : registeredEvents.length === 0 ? (
              <div className="text-xs text-gray-400">No events registered</div>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {registeredEvents.map((event, index) => (
                  <li key={`${event.eventCode}-${index}`} className="text-sm text-gray-300">
                    {formatRegisteredEventLine(event)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-700">
        <div className="mx-auto w-full max-w-6xl p-4 flex gap-4 justify-center">
          <button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className={`px-4 py-2 rounded focus:outline-none focus:ring-2 ${
              isSubmitDisabled
                ? "bg-gray-600 text-gray-300 cursor-not-allowed focus:ring-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400"
            }`}
          >
            {isEdit ? "Update" : "Submit"}
          </button>
          {isEdit && (
            <button
              onClick={onCreateNewRegistration}
              disabled={mutation.isPending}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                mutation.isPending
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-gray-600"
              }`}
            >
              Create New Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
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
  onBlur?: () => void;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
}

export const DojoAutocomplete = ({
  dojoList,
  value,
  onChange,
  onBlur,
  invalid = false,
  placeholder = "Type dojo name or city",
  className = "",
}: DojoAutocompleteProps) => {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const filteredDojos = dojoList.filter(
    (dojo) =>
      dojo.name.toLowerCase().includes(input.toLowerCase()) ||
      dojo.city.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    if (highlighted >= 0 && itemRefs.current[highlighted]) {
      itemRefs.current[highlighted]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted]);

  useEffect(() => {
    if (value.id === OTHER_DOJO_ID && value.freeText !== undefined) {
      setInput("Other");
      return;
    }

    if (value.id) {
      const dojo = dojoList.find((item) => item.id === value.id);
      if (dojo) {
        setInput(dojo.name);
      }
      return;
    }

    setInput("");
  }, [dojoList, value]);

  const handleSelectDojo = (dojo: Dojo) => {
    setInput(dojo.name);
    setShowDropdown(false);

    if (dojo.id === OTHER_DOJO_ID) {
      onChange({ id: OTHER_DOJO_ID, freeText: "" });
      return;
    }

    onChange({ id: dojo.id, freeText: "" });
  };

  const handleFreeTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ id: OTHER_DOJO_ID, freeText: event.target.value });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setShowDropdown(true);
      setHighlighted(0);
      return;
    }

    if (!filteredDojos.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      setHighlighted((prev) => (prev + 1) % filteredDojos.length);
    } else if (event.key === "ArrowUp") {
      setHighlighted((prev) => (prev - 1 + filteredDojos.length) % filteredDojos.length);
    } else if (event.key === "Enter" && highlighted >= 0) {
      handleSelectDojo(filteredDojos[highlighted]);
    } else if (event.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const dojoInputClassName = `${baseInputClassName} ${
    invalid ? "border-red-500 focus:ring-red-500" : "border-gray-600 focus:ring-blue-500"
  }`;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setShowDropdown(true);
          setHighlighted(-1);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => {
          window.setTimeout(() => setShowDropdown(false), 100);
          onBlur?.();
        }}
        onKeyDown={handleKeyDown}
        className={dojoInputClassName}
        placeholder={placeholder}
        autoComplete="do-not-auto-fill"
        aria-invalid={invalid}
      />
      {showDropdown && filteredDojos.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 max-h-48 overflow-auto">
          {filteredDojos.map((dojo, index) => (
            <li
              key={dojo.id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-700 ${
                highlighted === index ? "bg-gray-700" : ""
              }`}
              onMouseDown={() => handleSelectDojo(dojo)}
              onMouseEnter={() => setHighlighted(index)}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
            >
              <span className="font-medium">{dojo.name}</span>
              <span className="ml-2 text-xs text-gray-400">{dojo.city}</span>
            </li>
          ))}
        </ul>
      )}
      {value.id === OTHER_DOJO_ID && (
        <input
          type="text"
          value={value.freeText || ""}
          onChange={handleFreeTextChange}
          onBlur={onBlur}
          className={`mt-2 ${dojoInputClassName}`}
          placeholder="Enter dojo name"
          aria-invalid={invalid}
        />
      )}
    </div>
  );
};