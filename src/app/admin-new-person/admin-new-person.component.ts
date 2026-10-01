import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminFamilyService } from '../services/admin-family.service';
import { AdminPerson } from '../interfaces/admin-person';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PersonChange } from '../interfaces/person-change';
import { ScrollToTopButtonComponent } from '../templates/scroll-to-top-button/scroll-to-top-button.component';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';
import { AdminRelations } from '../interfaces/admin-relations';
import { NewFamily } from '../interfaces/new-family';

@Component({
  selector: 'app-admin-new-person',
  imports: [ScrollToTopButtonComponent, FormsModule, CommonModule],
  templateUrl: './admin-new-person.component.html',
  styleUrl: './admin-new-person.component.scss',
})
export class AdminNewPersonComponent {
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
  expandedMarriageBoxes = new Set<number>();
  personPopupOpen = false;
  personPopupType: 'father' | 'mother' | 'spouse' | 'child' | null = null;
  personPopupMarriageIndex: number | null = null;
  personPopupChildIndex: number | null = null;
  personPopupPerson: AdminPerson | null = null;
  personSearchTerm = '';
  personSearchResults: AdminPerson[] = [];
  personSearchLoading = false;
  personPopupSelectedPerson: AdminPerson | null = null;

  family: NewFamily = {
    parents: [null, null],

    marriages: [
      {
        spouse: null,
        marr_date: null,
        marr_plac: null,
        fam_stat: null,
        children: []
      },
      {
        spouse: null,
        marr_date: null,
        marr_plac: null,
        fam_stat: null,
        children: []
      },
      {
        spouse: null,
        marr_date: null,
        marr_plac: null,
        fam_stat: null,
        children: []
      },
      {
        spouse: null,
        marr_date: null,
        marr_plac: null,
        fam_stat: null,
        children: []
      }
    ]
  };

  familyStatusChoices = [
    { value: 'married', label: 'verheiratet' },
    { value: 'not_married', label: 'nicht verheiratet' },
    { value: 'widowed', label: 'verwitwet' },
    { value: 'divorced', label: 'geschieden' }
  ];
  availableFamilies: string[] = [];
  selectedFamily = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute, private router: Router,
    private adminFamilyService: AdminFamilyService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    const family1 = localStorage.getItem('family_1');
    const family2 = localStorage.getItem('family_2');

    this.availableFamilies = [family1, family2]
      .filter((family): family is string => !!family);
    console.log(this.availableFamilies);

    if (this.availableFamilies.length === 1) {
      this.selectedFamily = this.availableFamilies[0];
    }
  }

  save(): void {
    if (!this.selectedFamily) {
      alert('Bitte wähle einen Stammbaum aus.');
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

    const personData = this.assemblePersonData();
    const relationData = this.assembleRelationData();

    this.adminFamilyService
      .updatePerson(this.person.refn, personData)
      .subscribe({
        next: person => {
          this.clearPersonData(person);
          this.saveRelation(person, relationData);
        },
        error: error => {
          console.error(error);
          this.loadingService.hide();
          this.error =
            `Person konnte nicht gespeichert werden. (${error.status})`;
          alert(this.error);
        }
      });
  }

  private assemblePersonData(): FormData {
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

    this.appendImageData(formData);

    return formData;
  }

  private appendImageData(formData: FormData): void {
    for (let i = 1; i <= 6; i++) {
      const title =
        this.person?.[`obje_titl_${i}` as keyof AdminPerson];

      formData.append(
        `obje_titl_${i}`,
        (title as string | null | undefined) ?? ''
      );
    }

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
  }

  private assembleRelationData(): Partial<AdminRelations> {
    if (!this.family) {
      return {};
    }

    const relationData: Partial<AdminRelations> = {
      fath_refn: this.family.parents[0]?.refn ?? null,
      moth_refn: this.family.parents[1]?.refn ?? null
    };

    this.family.marriages.forEach((marriage, i) => {
      const index = i + 1;

      const marriageData = {
        [`marr_spou_refn_${index}`]:
          marriage.spouse?.refn ?? null,

        [`marr_date_${index}`]:
          marriage.marr_date,

        [`marr_plac_${index}`]:
          marriage.marr_plac,

        [`fam_stat_${index}`]:
          marriage.fam_stat,

        [`children_${index}`]:
          marriage.children
            .filter((child): child is AdminPerson => child !== null)
            .map(child => child.refn)
      };

      Object.assign(relationData, marriageData);
    });

    return relationData;
  }

  private saveRelation(
    person: AdminPerson,
    relationData: Partial<AdminRelations>
  ): void {
    this.adminFamilyService
      .updateRelation(this.person!.refn, relationData)
      .subscribe({
        next: () => {
          this.clearRelationData();
          this.successMessage = 'Person wurde geändert.';
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        },
        error: error => {
          console.error(error);
          this.loadingService.hide();
          this.error =
            `Familiendaten konnten nicht gespeichert werden. (${error.status})`;
          alert(this.error);
        },
        complete: () => {
          this.loadingService.hide();
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
    const changes: PersonChange[] = [];

    const addChange = (
      label: string,
      value: string | null | undefined
    ): void => {
      const newValue = value?.trim() ?? '';

      if (newValue) {
        changes.push({
          label,
          oldValue: '',
          newValue
        });
      }
    };

    addChange('Vorname', this.givn);
    addChange('Nachname', this.surn);
    addChange('Rufname', this.nameRufname);
    addChange('Spitzname', this.nameNick);
    addChange('Beruf', this.occu);
    addChange('Religion', this.reli);
    addChange('Namenspräfix', this.nameNpfx);
    addChange('Geburtsname', this.nameMarnm);
    addChange('Quelle', this.sour);
    addChange('Notiz', this.note);
    addChange('Geburtsdatum', this.birtDate);
    addChange('Geburtsort', this.birtPlac);
    addChange('Sterbedatum', this.deatDate);
    addChange('Sterbeort', this.deatPlac);
    addChange('Taufdatum', this.chrDate);
    addChange('Taufort', this.chrPlac);
    addChange('Beerdigungsdatum', this.buriDate);
    addChange('Beerdigungsort', this.buriPlac);
    addChange('Tauf-/Kirchenadresse', this.chrAddr);
   // addChange('Geschlecht', this.sex);
 
    changes.push(...this.getSexChanges());
    changes.push(...this.getConfidentialityChanges());
    changes.push(...this.getFamilyChanges());
    changes.push(...this.getParentChanges());
    changes.push(...this.getSpousesChanges());
    changes.push(...this.getMarriageDataChanges());
    changes.push(...this.getChildrenChanges());

    changes.push(...this.getPictureChanges());

    return changes;
  }

private getSexChanges(): PersonChange[] {

    const sexLabel =
      this.sex === 'F'
        ? 'weiblich'
        : this.sex === 'M'
          ? 'männlich'
          : this.sex === 'D'
            ? 'divers'
            : this.sex;

    return [
      {
        label: 'Vertraulichkeit',
        oldValue: '',
        newValue: sexLabel
      }
    ];
  }


  private getConfidentialityChanges(): PersonChange[] {
    if (!this.confidential) {
      return [];
    }

    const confidentialLabel =
      this.confidential === 'no'
        ? 'Nein'
        : this.confidential === 'restricted'
          ? 'Eingeschränkt'
          : this.confidential === 'yes'
            ? 'Ja'
            : this.confidential;

    return [
      {
        label: 'Vertraulichkeit',
        oldValue: '',
        newValue: confidentialLabel
      }
    ];
  }


  private getFamilyChanges(): PersonChange[] {
    if (!this.selectedFamily) {
      return [];
    }

    const familyLabel =
      this.selectedFamily === 'kempe'
        ? 'Kempe'
        : this.selectedFamily === 'huenten'
          ? 'Hünten'
          : this.selectedFamily;

    return [
      {
        label: 'Stammbaum',
        oldValue: '',
        newValue: familyLabel
      }
    ];
  }

  private getParentChanges(): PersonChange[] {
    const changes: PersonChange[] = [];

    const father = this.family.parents[0];

    if (father) {
      changes.push({
        label: 'Vater',
        oldValue: '',
        newValue: father.name
      });
    }

    const mother = this.family.parents[1];

    if (mother) {
      changes.push({
        label: 'Mutter',
        oldValue: '',
        newValue: mother.name
      });
    }

    return changes;
  }

  private getSpousesChanges(): PersonChange[] {
    const changes: PersonChange[] = [];

    this.family.marriages.forEach((marriage, i) => {
      if (marriage.spouse) {
        changes.push({
          label: `Partnerschaft ${i + 1}`,
          oldValue: '',
          newValue: marriage.spouse.name
        });
      }
    });

    return changes;
  }

  private getMarriageDataChanges(): PersonChange[] {
    const changes: PersonChange[] = [];

    for (let i = 0; i < this.family.marriages.length; i++) {
      const marriage = this.family.marriages[i];
      const index = i + 1;

      if (marriage.marr_date?.trim()) {
        changes.push({
          label: `Heiratsdatum ${index}`,
          oldValue: '',
          newValue: marriage.marr_date
        });
      }

      if (marriage.marr_plac?.trim()) {
        changes.push({
          label: `Heiratsort ${index}`,
          oldValue: '',
          newValue: marriage.marr_plac
        });
      }

      if (marriage.fam_stat) {
        const status = this.familyStatusChoices.find(
          choice => choice.value === marriage.fam_stat
        );

        changes.push({
          label: `Familienstand ${index}`,
          oldValue: '',
          newValue: status?.label ?? marriage.fam_stat
        });
      }
    }

    return changes;
  }

  private getChildrenChanges(): PersonChange[] {
    const changes: PersonChange[] = [];

    for (let i = 0; i < this.family.marriages.length; i++) {
      const marriage = this.family.marriages[i];
      const index = i + 1;

      const childrenText = marriage.children
        .filter((child): child is AdminPerson => child !== null)
        .map(child => child.name)
        .join(', ');

      if (childrenText) {
        changes.push({
          label: `Kinder aus Partnerschaft ${index}`,
          oldValue: '',
          newValue: childrenText
        });
      }
    }

    return changes;
  }

  private getPictureChanges(): PersonChange[] {
    if (!this.person || !this.family) {
      return [];
    }
    const changes: PersonChange[] = [];
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

  clearPersonData(person: AdminPerson | null) {
    if (!person) {
      return
    }
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
  }

  clearRelationData() {
    if (this.family) {

    }

    this.expandedMarriageBoxes.clear();
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

  hasMarriageData(
    marriage: {
      spouse: AdminPerson | null;
      marr_date: string | null;
      marr_plac: string | null;
      fam_stat: string | null;
      children: (AdminPerson | null)[];
    },
    index: number
  ): boolean {
    if (index === 0) {
      return true;
    }

    if (this.expandedMarriageBoxes.has(index)) {
      return true;
    }

    return (
      marriage.spouse !== null ||
      !!marriage.marr_date?.trim() ||
      !!marriage.marr_plac?.trim() ||
      !!marriage.fam_stat ||
      marriage.children.some(child => child !== null)
    );
  }

  openPersonPopup(
    type: 'spouse' | 'child' | 'father' | 'mother',
    marriageIndex: number,
    person: AdminPerson | null,
    childIndex: number | null = null
  ): void {
    this.personPopupType = type;
    this.personPopupMarriageIndex = marriageIndex;
    this.personPopupChildIndex = childIndex;
    this.personPopupPerson = person;
    this.personPopupSelectedPerson = person;
    this.personSearchTerm = '';
    this.personSearchResults = [];
    this.personPopupOpen = true;
  }

  closePersonPopup(): void {
    this.personPopupOpen = false;
    this.personPopupType = null;
    this.personPopupMarriageIndex = null;
    this.personPopupChildIndex = null;
    this.personPopupPerson = null;
    this.personPopupSelectedPerson = null;
    this.personSearchTerm = '';
    this.personSearchResults = [];
  }

  searchPersons() {
    const search = this.personSearchTerm.trim();
    if (!search) {
      this.personSearchResults = [];
      return;
    }
    this.personSearchLoading = true;
    this.adminFamilyService.searchRelatedPersons(search).subscribe({
      next: (persons) => {
        this.personSearchResults = persons;
        this.personSearchLoading = false;
      },
      error: (error) => {
        console.error('Fehler bei der Personensuche:', error);
        this.personSearchResults = [];
        this.personSearchLoading = false;
      }
    });
  }

  selectPerson(person: AdminPerson): void {
    this.personPopupSelectedPerson = person;
    console.log(this.personPopupSelectedPerson);
  }

  savePersonPopup(): void {
    if (!this.personPopupSelectedPerson) {
      return;
    }

    const person = this.personPopupSelectedPerson;

    switch (this.personPopupType) {

      case 'father':
        if (this.family) {
          this.family.parents[0] = person;
        }
        break;

      case 'mother':
        if (this.family) {
          this.family.parents[1] = person;
        }
        break;

      case 'spouse':
        if (
          this.family &&
          this.personPopupMarriageIndex !== null
        ) {
          this.family.marriages[
            this.personPopupMarriageIndex
          ].spouse = person;
        }
        break;

      case 'child':
        if (
          this.family &&
          this.personPopupMarriageIndex !== null
        ) {
          const marriage =
            this.family.marriages[
            this.personPopupMarriageIndex
            ];

          if (this.personPopupChildIndex !== null) {
            // Bestehendes Kind ändern
            marriage.children[
              this.personPopupChildIndex
            ] = person;
          } else {
            // Neues Kind hinzufügen
            marriage.children.push(person);
          }
        }
        break;
    }

    this.closePersonPopup();
  }

  removePersonFromPopup(): void {
    if (!this.family) {
      return;
    }

    switch (this.personPopupType) {

      case 'father':
        this.family.parents[0] = null;
        break;

      case 'mother':
        this.family.parents[1] = null;
        break;

      case 'spouse':
        if (this.personPopupMarriageIndex !== null) {
          this.family.marriages[
            this.personPopupMarriageIndex
          ].spouse = null;
        }
        break;

      case 'child':
        if (
          this.personPopupMarriageIndex !== null &&
          this.personPopupChildIndex !== null
        ) {
          this.family.marriages[
            this.personPopupMarriageIndex
          ].children.splice(
            this.personPopupChildIndex,
            1
          );
        }
        break;
    }

    this.closePersonPopup();
  }

  newPartnerChildBox(index: number): void {
    this.expandedMarriageBoxes.add(index);
  }

  goToSearch(): void {
    this.pendingChanges = this.getChanges();
    if (this.pendingChanges.length > 0) {
      const proceed = window.confirm(
        'Es gibt ungespeicherte Änderungen.\n\n' +
        'Bitte speichere die Änderungen zuerst, bevor du eine neue Person anlegst.\n\n' +
        'Möchtest du trotzdem zur Suche wechseln?'
      );

      if (!proceed) {
        return;
      }
    }

    this.router.navigate(['/admin-ancestors']);
  }

}
