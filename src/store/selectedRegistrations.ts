import { atom } from "jotai";

export type DrawRegistration = {
	id: number;
	registrationId: number;
	firstName: string;
	lastName: string;
	participantGender: string;
	participantRank: string;
	divisionName: string;
	eventName: string;
	eventDisplayName: string;
	dojoName?: string | null;
};

export const selectedRegistrationsAtom = atom<DrawRegistration[]>([]);
