import { AdminPerson } from "./admin-person";
import { AdminRelations } from "./admin-relations";

export interface AdminPersonCreateResponse {
  person: AdminPerson;
  relation: AdminRelations;
}