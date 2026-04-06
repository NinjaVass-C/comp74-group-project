export function ValidateNumber (input: any, positiveNumber: boolean = true): boolean {
    if (!input || typeof input !== 'number' || (positiveNumber && input <= 0)) {
        return false;
    } else {
        return true;
    }
}

export function ValidateString (input: any): boolean {
    if (!input || typeof input !== 'string' || input.trim() === '') {
        return false;
    } else {
        return true;
    }
}