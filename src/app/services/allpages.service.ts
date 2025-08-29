import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AllpagesService {

  public imageFiles: File[] = new Array(4);


  constructor() { }


    prepareImages(info: { [x: string]: any; }) {
    const images: { original: string; thumbnail: string }[] = [];
    for (let i = 1; i <= 4; i++) {
      const originalUrl = info[`image_${i}_url`];
      const thumbnailUrl = info[`image_${i}_thumbnail_url`];
      if (originalUrl) {
        images.push({ original: originalUrl, thumbnail: thumbnailUrl });
      }
    }
    return images;
  }

  preparePdfs(info: { [x: string]: any; }) {
    const pdfs: { url: string; name: string }[] = [];
    for (let i = 1; i <= 4; i++) {
      const pdfUrl = info[`pdf_${i}_url`];
      const pdfName = info[`pdf_${i}_name`];
      if (pdfUrl) {
        pdfs.push({ url: pdfUrl, name: pdfName });
      }
    }
    return pdfs;

  }

  /**
   * Adds new images to the form data.
   *
   * @param {FormData} formData - The form data to which images will be added.
   */
  addNewImages(entry: { [x: string]: any; }, imageFiles: any[], formData: FormData): void {
    imageFiles.forEach((file) => {
      const imageField = this.getNextAvailableImageField(entry, formData);
      if (imageField) {
        formData.append(imageField, file, file.name);
      }
    });
  }

  /**
 * Adds new images to the form data.
 *
 * @param {FormData} formData - The form data to which images will be added.
 */
addNewPdfs(entry: { [key: string]: any }, pdfFiles: any[], formData: FormData): void {
  pdfFiles.forEach((pdf) => {
    const pdfField = this.getNextAvailablePdfField(entry, formData); // z. B. "pdf_1"
    if (pdfField) {
      // PDF selbst
      formData.append(pdfField, pdf.file, pdf.file.name);

      // Falls CustomName vergeben → eigenen Key anhängen
      const customName = pdf.customName?.trim() || pdf.file.name; // fallback: Originalname
      formData.append(pdfField + '_name', customName);
    }
  });
}

  /**
   * Adds null fields for any deleted images to the form data.
   *
   * @param {FormData} formData - The form data to which null fields will be added.
   */
  addNullFields(entry: { [x: string]: any; }, formData: FormData): void {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;
      if (!entry[imageField] && !formData.has(imageField)) {
        formData.append(imageField, '');
      }
    }
  }

  addNullPdfFields(entry: { [key: string]: any }, formData: FormData): void {
    for (let i = 1; i <= 4; i++) {
      const pdfField = `pdf_${i}`;
      if (!entry[pdfField] && !formData.has(pdfField)) {
        formData.append(pdfField, '');
      }
    }
  }

  /**
 * Gets the next available image field for a new image.
 *
 * @returns {string | null} The name of the next available image field (e.g., 'image_1'), or `null` if all fields are occupied.
 */
  getNextAvailableImageField(entry: { [x: string]: any; }, formData: FormData): string | null {
    for (let i = 1; i <= 4; i++) {
      const imageField = `image_${i}`;

      if (!entry[imageField] && !formData.has(imageField)) {
        return imageField;
      }
    }
    return null;
  }

  getNextAvailablePdfField(entry: { [key: string]: any }, formData: FormData): string | null {
    for (let i = 1; i <= 4; i++) {
      const field = `pdf_${i}`;
      if (!entry[field] && !formData.has(field)) {
        return field;
      }
    }
    return null;
  }


  /**
 * Retrieves an array of image URLs from the given info object.
 *
 * @param {any} info - The object containing image URLs.
 * @returns {string[]} An array of image URLs.
 */
  getImageArray(info: any): { original: string; thumbnail: string }[] {
    const images: { original: string; thumbnail: string }[] = [];

    for (let i = 1; i <= 4; i++) {
      const originalUrl = info[`image_${i}_url`];
      const thumbnailUrl = info[`image_${i}_thumbnail_url`];

      if (originalUrl) {
        images.push({ original: originalUrl, thumbnail: thumbnailUrl });
      }
    }
    return images;
  }


  trackByPdfUrl(index: number, pdf: any): string {
  return pdf.url;
}

}
