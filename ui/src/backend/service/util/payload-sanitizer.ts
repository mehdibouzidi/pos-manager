export class PayloadSanitizer {
  static sanitize<T>(payload: T): T {
    return this.deepSanitize(payload) as T;
  }

  private static deepSanitize(value: any, seen: WeakSet<object> = new WeakSet()): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (value instanceof Date || value instanceof File || value instanceof Blob) {
      return value;
    }

    if (Array.isArray(value)) {
      const sanitizedArray = value
        .map((item) => this.deepSanitize(item, seen))
        .filter((item) => !this.isEmptyValue(item));

      return sanitizedArray;
    }

    if (seen.has(value)) {
      return value;
    }
    seen.add(value);

    const sanitizedObject: Record<string, any> = {};
    Object.keys(value).forEach((key) => {
      const sanitizedValue = this.deepSanitize(value[key], seen);
      if (sanitizedValue !== undefined) {
        sanitizedObject[key] = sanitizedValue;
      }
    });

    const hasId = Object.prototype.hasOwnProperty.call(value, 'id');
    const idValue = (value as { id?: number }).id;
    const nonIdKeys = Object.keys(sanitizedObject).filter(
      (key) =>
        key !== 'id' &&
        !this.isEmptyValue(sanitizedObject[key])
    );

    if (hasId && (idValue === null || idValue === undefined)) {
      return nonIdKeys.length === 0 ? null : sanitizedObject;
    }

    if (hasId && idValue !== null && idValue !== undefined && nonIdKeys.length === 0) {
      return { id: idValue };
    }

    return sanitizedObject;
  }

  private static isEmptyValue(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (value instanceof Date || value instanceof File || value instanceof Blob) {
      return false;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    return false;
  }
}
