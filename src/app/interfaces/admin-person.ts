export interface AdminPerson {
  id: number;
  refn: string;
  name: string;

  family_1: string;
  family_2: string | null;

  fath_name: string | null;
  fath_refn: string | null;
  moth_name: string | null;
  moth_refn: string | null;

  uid: string | null;
  surn: string | null;
  givn: string | null;
  sex: string;
  occu: string | null;

  chan_date: string | null;
  chan_date_time: string | null;

  birt_date: string | null;
  birth_date_formatted: string | null;
  birt_plac: string | null;

  deat_date: string | null;
  death_date_formatted: string | null;
  deat_plac: string | null;

  note: string | null;
  chr_date: string | null;
  chr_plac: string | null;
  buri_date: string | null;
  buri_plac: string | null;

  name_rufname: string | null;
  name_npfx: string | null;
  sour: string | null;
  name_nick: string | null;
  name_marnm: string | null;
  chr_addr: string | null;
  reli: string | null;

  confidential: string;

  creation_date: string;
  last_modified_date: string;
  created_by: number | null;
  last_modified_by: number | null;
}