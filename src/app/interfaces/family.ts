import { Person } from "./person";

export interface Family {
    person: Person;
    parents: (Person | null)[];
    grandparents: (Person)[];
    marriages: {
      spouse: (Person | null);
      children: (Person | null)[];
    }[];
  }
  