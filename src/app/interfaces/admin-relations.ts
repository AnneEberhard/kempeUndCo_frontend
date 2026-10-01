export interface AdminRelations {
  person: string;

  fath_refn: string | null;
  fath_name: string | null;
  moth_refn: string | null;
  moth_name: string | null;

  marr_spou_refn_1: string | null;
  marr_date_1: string | null;
  marr_plac_1: string | null;
  children_1: string[];
  fam_stat_1: string | null;

  marr_spou_refn_2: string | null;
  marr_date_2: string | null;
  marr_plac_2: string | null;
  children_2: string[];
  fam_stat_2: string | null;

  marr_spou_refn_3: string | null;
  marr_date_3: string | null;
  marr_plac_3: string | null;
  children_3: string[];
  fam_stat_3: string | null;

  marr_spou_refn_4: string | null;
  marr_date_4: string | null;
  marr_plac_4: string | null;
  children_4: string[];
  fam_stat_4: string | null;
}