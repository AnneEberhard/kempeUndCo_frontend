import { AdminPerson } from './admin-person';
import { AdminRelations } from './admin-relations';

export interface EditFamily {
  parents: (AdminPerson | null)[];
  marriages: {
    spouse: AdminPerson | null;
    marr_date: string | null;
    marr_plac: string | null;
    fam_stat: string | null;
    children: (AdminPerson | null)[];
  }[];
  originalRelation: AdminRelations;
}