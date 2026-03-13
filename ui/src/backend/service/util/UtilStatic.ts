
export class UtilStatic {
  static readonly ADD = 'add';
  static readonly DUPLICATE = 'duplicate';
  static readonly UPDATE = 'update';
  static readonly DELETE = 'delete';
  static readonly FIND_ALL = 'findAll';
  static readonly FIND_ALL_BY_CRITERIA = 'findAllByCriteria';
  static readonly FIND_BY_DATE_EP = 'findByDate';
  static readonly FIND_BY_CODE_EP = 'findByCode';
  static readonly EXISTS_BY_CODE_EP = 'existsByCode';
  static readonly CODE = 'code';
  static readonly SLASH = '/';
  static readonly IMPORT = 'import';
  static readonly CALCULATE = 'calculate';
  static readonly GENERATE = 'generate';
  static readonly GENERATE_CSV = 'generatecsv';
  static readonly GENERATE_EXCEL = 'generateexcel';
  static readonly SCALE_WITH_AI = 'scaleWithAi';
  static readonly PREVISION = 'prevision';
  static readonly FROM_QUOTATION = 'fromQuotation';

  static readonly TOKEN = 'pos-token';
  static readonly USERNAME = 'username';
  static readonly PRIVILEGES = 'privileges';
  static readonly FIRSTNAME = 'firstname';
  static readonly LASTNAME = 'lastname';
  static readonly STORE_ID = 'storeId';
  static readonly STORE_CODE = 'storeCode';
  static readonly STORE_NAME = 'storeName';
  static readonly SUPER_ADMIN = 'superAdmin';

  static isMobile() {
    if (window.screen.width <= 770) {
      // 768px portrait
      return true;
    }
    return false;
  }

  static refreshApp() {
    window.location.reload();
  }

  static toJSONObject(obj: any): any {
    return JSON.parse(JSON.stringify(obj, null, 2));
  }

  static getDateFromDateTimePickerString(selectedDate: any) {
    if (selectedDate && selectedDate instanceof Date) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(selectedDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }
    return null;
  }

  static getDateFromDatePicker(selectedDate: any): Date | null {
    if (selectedDate == null) {
      return null;
    }

    if (selectedDate instanceof Date) {
      return this.buildDateFromParts(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        selectedDate.getDate()
      );
    }

    if (Array.isArray(selectedDate)) {
      const [year, month, day] = selectedDate.map((value) => Number(value));
      return this.buildDateFromParts(year, month, day);
    }

    if (typeof selectedDate === 'object') {
      const year = Number(
        selectedDate.year ?? selectedDate.y ?? selectedDate['$y']
      );
      let monthValue =
        selectedDate.month ??
        selectedDate.monthValue ??
        selectedDate.m ??
        selectedDate['$M'];

      const month = Number(monthValue);
      const day = Number(
        selectedDate.day ?? selectedDate.dayOfMonth ?? selectedDate.d ?? selectedDate['$D']
      );

      if (!Number.isNaN(year) && !Number.isNaN(day)) {
        const monthIndex =
          typeof monthValue === 'string'
            ? this.mapMonthNameToNumber(monthValue)
            : month;

        // Some adapters (moment) expose month as zero-based ($M)
        const isZeroBasedMonth =
          selectedDate['$M'] != null || selectedDate.monthValueZeroBased != null;
        const normalizedMonth = isZeroBasedMonth
          ? (monthIndex ?? month) + 1
          : monthIndex ?? month;
        const fallbackMonth =
          typeof monthValue === 'string'
            ? this.mapMonthNameToNumber(monthValue)
            : Number(selectedDate.monthValue ?? selectedDate.month);

        const resolvedMonth =
          Number.isNaN(normalizedMonth ?? NaN) ? fallbackMonth : normalizedMonth;

        let finalMonth =
          resolvedMonth ?? fallbackMonth ?? (monthIndex ?? month ?? null);

        if (typeof finalMonth === 'number' && finalMonth <= 0) {
          finalMonth = finalMonth + 1;
        }

        return this.buildDateFromParts(year, finalMonth, day);
      }
    }

    if (typeof selectedDate === 'string') {
      const trimmedDate = selectedDate.trim();
      if (!trimmedDate) {
        return null;
      }

      const datePortion = trimmedDate.split(/[T\s]/)[0];
      let parts: number[] = datePortion.split('-').map(Number);

      if (parts.some((value) => Number.isNaN(value))) {
        parts = datePortion.split('/').map(Number);
        if (parts.some((value) => Number.isNaN(value))) {
          return null;
        }

        // Handle dd/MM/yyyy by swapping when obvious.
        if (parts[0] > 12 && parts[2] >= 1000) {
          parts = [parts[2], parts[1], parts[0]];
        }
      }

      const [year, month, day] = parts;
      return this.buildDateFromParts(year, month, day);
    }

    if (typeof selectedDate === 'number') {
      const date = new Date(selectedDate);
      return Number.isNaN(date.getTime()) ? null : this.getDateFromDatePicker(date);
    }

    return null;
  }

  private static buildDateFromParts(
    year?: number,
    month?: number,
    day?: number
  ): Date | null {
    if (
      year == null ||
      month == null ||
      day == null ||
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day)
    ) {
      return null;
    }

    const normalizedMonth = month - 1;
    if (
      year < 0 ||
      normalizedMonth < 0 ||
      normalizedMonth > 11 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    return new Date(Date.UTC(year, normalizedMonth, day));
  }

  private static mapMonthNameToNumber(month: string | number | undefined): number | null {
    if (typeof month === 'number') {
      return month;
    }

    if (typeof month !== 'string') {
      return null;
    }

    const normalized = month.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    const monthAliases: Record<string, number> = {
      january: 1,
      jan: 1,
      janvier: 1,
      february: 2,
      feb: 2,
      fevrier: 2,
      février: 2,
      march: 3,
      mar: 3,
      mars: 3,
      april: 4,
      apr: 4,
      avril: 4,
      may: 5,
      mai: 5,
      june: 6,
      jun: 6,
      juin: 6,
      july: 7,
      jul: 7,
      juillet: 7,
      august: 8,
      aug: 8,
      aout: 8,
      août: 8,
      september: 9,
      sep: 9,
      sept: 9,
      septembre: 9,
      october: 10,
      oct: 10,
      octobre: 10,
      november: 11,
      nov: 11,
      novembre: 11,
      december: 12,
      dec: 12,
      décembre: 12,
      decembre: 12
    };

    return monthAliases[normalized] ?? null;
  }

  static getRecipePicture(dndComponent: any) {
    return this.getPictureFromDnd(dndComponent);
  }

  static getPictureFromDnd(
    dndComponent: any){
    if (dndComponent.files != null && dndComponent.files[0] != null) {
      return dndComponent.files[0];
    }
    return null;
  }

  static getCSVFromDnd(dndComponent: any) {
    if (dndComponent.files != null && dndComponent.files[0] != null) {
      return dndComponent.files[0];
    } else {
      return null;
    }
  }

  static getFileFromDnd(dndComponent: any) {
    if (dndComponent.files != null && dndComponent.files[0] != null) {
      return dndComponent.files[0];
    }
    return null;
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static base64ToFile(base64: string, filename: string, contentType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: contentType });
  }

  static sortInstructions(instructions: any[]) {
    const groupedInstructions = (instructions ?? []).reduce((acc: any, instruction: any) => {
      const typeCode = instruction?.type?.code ?? instruction?.typeCode ?? '';
      if (!typeCode) {
        return acc;
      }
      if (!acc[typeCode]) {
        acc[typeCode] = [];
      }
      acc[typeCode].push(instruction);
      return acc;
    }, {});

    const sortedInstructions = Object.keys(groupedInstructions)
      .sort()
      .reduce((acc, typeCode) => {
        const sortedGroup = groupedInstructions[typeCode].sort(
          (a: any, b: any) => a.order - b.order
        );
        return acc.concat(sortedGroup);
      }, []);

    return sortedInstructions;
  }

  static containsWord(text: string, word: string): boolean {
    const regex = new RegExp(`\\b${word}\\b`, "i"); // \b assure qu'on détecte le mot entier
    return regex.test(text.toLowerCase());
  }

  static filterByNames(items: any[], names: any[]): any[] {
    const nameSet = new Set(names.map((name: any) => name.toLowerCase())); // Ignorer la casse
    return items.filter((item: any) => nameSet.has(item.name.toLowerCase()));
  }

  static boldWords(text: string, words: string[]): string {
    const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }
}
