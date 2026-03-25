import { atom } from "jotai";

export type DrawRegistration = {
	id: number;
	firstName: string;
	lastName: string;
	participantGender: string;
	participantRank: string;
	divisionName: string;
	eventName: string;
	eventDisplayName: string;
};

export const selectedRegistrationsAtom = atom<DrawRegistration[]>([]);
