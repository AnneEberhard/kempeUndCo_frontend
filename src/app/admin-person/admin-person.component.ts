import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminFamilyService } from '../services/admin-family.service';
import { AdminPerson } from '../interfaces/admin-person';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PersonChange } from '../interfaces/person-change';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-person',
  standalone: true,
  imports: [ScrollToTopButtonComponent, FormsModule, CommonModule],
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
  imageFiles: (File | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null
  ];

  imagePreviews: (string | null)[] = [
    null,
    null,
    null,
    null,
    null,
    null
  ];

  deletedImageSlots = new Set<number>();;

  pendingChanges: PersonChange[] = [];
  noNewChanges: boolean = true;
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
    this.noNewChanges = false;

    if (this.pendingChanges.length === 0) {
      this.noNewChanges = true;
    }
    this.showSaveConfirmation = true;
  }



  confirmSave(): void {
    if (!this.person) {
      return;
    }

    this.showSaveConfirmation = false;
    this.error = '';

    const formData = new FormData();

    formData.append('givn', this.givn);
    formData.append('surn', this.surn);
    formData.append('name_rufname', this.nameRufname);
    formData.append('name_nick', this.nameNick);
    formData.append('occu', this.occu);
    formData.append('reli', this.reli);
    formData.append('name_npfx', this.nameNpfx);
    formData.append('name_marnm', this.nameMarnm);
    formData.append('sour', this.sour);
    formData.append('note', this.note);

    formData.append('birt_date', this.birtDate);
    formData.append('birt_plac', this.birtPlac);

    formData.append('deat_date', this.deatDate);
    formData.append('deat_plac', this.deatPlac);

    formData.append('chr_date', this.chrDate);
    formData.append('chr_plac', this.chrPlac);
    formData.append('chr_addr', this.chrAddr);

    formData.append('buri_date', this.buriDate);
    formData.append('buri_plac', this.buriPlac);

    formData.append('sex', this.sex);
    formData.append('confidential', this.confidential);

    // Bildtitel
    for (let i = 1; i <= 6; i++) {
      const title =
        this.person[`obje_titl_${i}` as keyof AdminPerson];

      formData.append(
        `obje_titl_${i}`,
        (title as string | null | undefined) ?? ''
      );
    }

    // Neue Bilder
    for (let i = 0; i < 6; i++) {
      const file = this.imageFiles[i];

      if (file) {
        formData.append(
          `obje_file_${i + 1}`,
          file,
          file.name
        );
      }

    }

    for (const index of this.deletedImageSlots) {
      formData.append(`delete_obje_file_${index}`, 'true');
    }

    this.adminFamilyService
      .updatePerson(this.person.refn, formData)
      .subscribe({
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

          // Auswahl zurücksetzen
          this.imageFiles = [
            null,
            null,
            null,
            null,
            null,
            null
          ];
          this.deletedImageSlots.clear();
          this.imagePreviews = [
            null,
            null,
            null,
            null,
            null,
            null
          ];
        },


        error: error => {
          console.error(error);
          this.error =
            `Person konnte nicht gespeichert werden. (${error.status})`;
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


    // Bilder
    for (let i = 1; i <= 6; i++) {
      const oldImage = this.person[
        `obje_file_${i}` as keyof AdminPerson
      ] as string | null | undefined;

      const newFile = this.imageFiles[i - 1];

      if (this.deletedImageSlots.has(i)) {
        if (oldImage) {
          changes.push({
            label: `Bild ${i}`,
            oldValue: 'vorhanden',
            newValue: 'gelöscht'
          });
        }
      } else if (newFile) {
        changes.push({
          label: `Bild ${i}`,
          oldValue: oldImage ? 'vorhanden' : '',
          newValue: `hinzugefügt: ${newFile.name}`
        });
      }
    }

    return changes;
  }


  onImageFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (
      file.type !== 'image/jpeg' &&
      file.type !== 'image/png'
    ) {
      alert('Nur JPG und PNG Dateien sind erlaubt.');
      input.value = '';
      return;
    }

    // index ist 1-basiert: 1 -> Array-Index 0
    this.imageFiles[index - 1] = file;
    this.imagePreviews[index - 1] =
      URL.createObjectURL(file);
  }

  getExistingImage(index: number): string | null {
    if (!this.person) {
      return null;
    }

    return this.person[
      `obje_file_${index}` as keyof AdminPerson
    ] as string | null ?? null;
  }

  removeExistingImage(index: number): void {
    if (this.deletedImageSlots.has(index)) {
      // Löschung rückgängig machen
      this.deletedImageSlots.delete(index);
    } else {
      // Bild zum Löschen markieren
      this.deletedImageSlots.add(index);
    }
  }

  isImageSlotAvailable(index: number): boolean {
    return !this.getExistingImage(index);
  }

  isImageDeleted(index: number): boolean {
    return this.deletedImageSlots.has(index);
  }

  removeImagePreview(index: number): void {
  this.imagePreviews[index - 1] = null;
  this.imageFiles[index - 1] = null;
    const input = document.getElementById(
    `image${index}`
  ) as HTMLInputElement | null;

  if (input) {
    input.value = '';
  }
}
}
