import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminFamilyService } from '../services/admin-family.service';
import { AdminPerson } from '../interfaces/admin-person';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PersonChange } from '../interfaces/person-change';

@Component({
  selector: 'app-admin-person',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-person.component.html',
  styleUrl: './admin-person.component.scss'
})
export class AdminPersonComponent implements OnInit {

  person: AdminPerson | null = null;
  error = '';
  givn = '';
  surn = '';
  nameRufname = '';
  nameNick = '';
  occu = '';
  reli = '';
  nameNpfx = '';
  nameMarnm = '';
  sour = '';
  note = '';
  birtDate = '';
  birtPlac = '';
  deatDate = '';
  deatPlac = '';
  chrDate = '';
  chrPlac = '';
  chrAddr = '';
  buriDate = '';
  buriPlac = '';
  sex = 'D';
  confidential = 'no';

  pendingChanges: PersonChange[] = [];
  showSaveConfirmation = false;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private adminFamilyService: AdminFamilyService
  ) { }


  ngOnInit(): void {
    const refn = this.route.snapshot.paramMap.get('refn');

    if (!refn) {
      this.error = 'Keine REFN angegeben.';
      return;
    }

    this.adminFamilyService.getPerson(refn).subscribe({
      next: person => {
        this.person = person;
        this.givn = person.givn ?? '';
        this.surn = person.surn ?? '';
        this.nameRufname = person.name_rufname ?? '';
        this.nameNick = person.name_nick ?? '';
        this.occu = person.occu ?? '';
        this.reli = person.reli ?? '';
        this.nameNpfx = person.name_npfx ?? '';
        this.nameMarnm = person.name_marnm ?? '';
        this.sour = person.sour ?? '';
        this.note = person.note ?? '';
        this.birtDate = person.birt_date ?? '';
        this.birtPlac = person.birt_plac ?? '';
        this.deatDate = person.deat_date ?? '';
        this.deatPlac = person.deat_plac ?? '';
        this.chrDate = person.chr_date ?? '';
        this.chrPlac = person.chr_plac ?? '';
        this.chrAddr = person.chr_addr ?? '';
        this.buriDate = person.buri_date ?? '';
        this.buriPlac = person.buri_plac ?? '';
        this.sex = person.sex ?? 'D';
        this.confidential = person.confidential ?? 'no';

      },
      error: error => {
        console.error(error);
        this.error = `Person konnte nicht geladen werden. (${error.status})`;
      }
    });
  }

  save(): void {
    if (!this.person) {
      return;
    }

    this.pendingChanges = this.getChanges();

    if (this.pendingChanges.length === 0) {
      return;
    }

    this.showSaveConfirmation = true;
  }



  confirmSave(): void {
    if (!this.person) {
      return;
    }

    this.showSaveConfirmation = false;
    this.error = '';

      const data: Partial<AdminPerson> = {
    givn: this.givn,
      surn: this.surn,
      name_rufname: this.nameRufname,
      name_nick: this.nameNick,
      occu: this.occu,
      reli: this.reli,
      name_npfx: this.nameNpfx,
      name_marnm: this.nameMarnm,
      sour: this.sour,
      note: this.note,
      birt_date: this.birtDate,
      birt_plac: this.birtPlac,
      deat_date: this.deatDate,
      deat_plac: this.deatPlac,
      chr_date: this.chrDate,
      chr_plac: this.chrPlac,
      chr_addr: this.chrAddr,
      buri_date: this.buriDate,
      buri_plac: this.buriPlac,
      sex: this.sex,
      confidential: this.confidential,
  };

    this.adminFamilyService.updatePerson(this.person.refn, data).subscribe({
      next: person => {
        this.person = person;
        this.givn = person.givn ?? '';
        this.surn = person.surn ?? '';
        this.nameRufname = person.name_rufname ?? '';
        this.nameNick = person.name_nick ?? '';
        this.occu = person.occu ?? '';
        this.reli = person.reli ?? '';
        this.nameNpfx = person.name_npfx ?? '';
        this.nameMarnm = person.name_marnm ?? '';
        this.sour = person.sour ?? '';
        this.note = person.note ?? '';
        this.birtDate = person.birt_date ?? '';
        this.birtPlac = person.birt_plac ?? '';
        this.deatDate = person.deat_date ?? '';
        this.deatPlac = person.deat_plac ?? '';
        this.chrDate = person.chr_date ?? '';
        this.chrPlac = person.chr_plac ?? '';
        this.chrAddr = person.chr_addr ?? '';
        this.buriDate = person.buri_date ?? '';
        this.buriPlac = person.buri_plac ?? '';
        this.sex = person.sex ?? 'D';
        this.confidential = person.confidential ?? 'no';
      },
      error: error => {
        console.error(error);
        this.error = `Person konnte nicht gespeichert werden. (${error.status})`;
      }
    });
  }


  cancel(): void {
    this.router.navigate(['/admin-ancestors']);
  }

  cancelSave(): void {
  this.showSaveConfirmation = false;
}


  getChanges(): PersonChange[] {
    if (!this.person) {
      return [];
    }

    const changes: PersonChange[] = [];

    const compare = (
      label: string,
      oldValue: string | null,
      newValue: string
    ): void => {
      const oldText = oldValue ?? '';

      if (oldText !== newValue) {
        changes.push({
          label,
          oldValue: oldText,
          newValue
        });
      }
    };

    compare('Vorname', this.person.givn, this.givn);
    compare('Nachname', this.person.surn, this.surn);
    compare('Rufname', this.person.name_rufname, this.nameRufname);
    compare('Spitzname', this.person.name_nick, this.nameNick);
    compare('Beruf', this.person.occu, this.occu);
    compare('Religion', this.person.reli, this.reli);

    compare('Namenspräfix', this.person.name_npfx, this.nameNpfx);
    compare('Geburtsname', this.person.name_marnm, this.nameMarnm);
    compare('Quelle', this.person.sour, this.sour);
    compare('Notiz', this.person.note, this.note);

    compare('Geburtsdatum', this.person.birt_date, this.birtDate);
    compare('Geburtsort', this.person.birt_plac, this.birtPlac);

    compare('Sterbedatum', this.person.deat_date, this.deatDate);
    compare('Sterbeort', this.person.deat_plac, this.deatPlac);

    compare('Taufdatum', this.person.chr_date, this.chrDate);
    compare('Taufort', this.person.chr_plac, this.chrPlac);

    compare('Beerdigungsdatum', this.person.buri_date, this.buriDate);
    compare('Beerdigungsort', this.person.buri_plac, this.buriPlac);

    compare('Tauf-/Kirchenadresse', this.person.chr_addr, this.chrAddr);

    compare('Geschlecht', this.person.sex, this.sex);
    compare('Vertraulichkeit', this.person.confidential, this.confidential);

    return changes;
  }

}
