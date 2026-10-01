import { AdminPerson } from "./admin-person";

export interface NewFamily {
  parents: (AdminPerson | null)[];

  marriages: {
    spouse: AdminPerson | null;
    marr_date: string | null;
    marr_plac: string | null;
    fam_stat: string | null;
    children: (AdminPerson | null)[];
  }[];
}