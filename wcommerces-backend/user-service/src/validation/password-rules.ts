import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

function hasLowercase(s: string) {
  for (const c of s) {
    if (c >= "a" && c <= "z") return true;
  }
  return false;
}

function hasUppercase(s: string) {
  for (const c of s) {
    if (c >= "A" && c <= "Z") return true;
  }
  return false;
}

function hasDigit(s: string) {
  for (const c of s) {
    if (c >= "0" && c <= "9") return true;
  }
  return false;
}

function hasSymbol(s: string) {
  for (const c of s) {
    const isLower = c >= "a" && c <= "z";
    const isUpper = c >= "A" && c <= "Z";
    const isDigit = c >= "0" && c <= "9";
    if (!isLower && !isUpper && !isDigit) return true;
  }
  return false;
}

@ValidatorConstraint({ name: "containsLowercase", async: false })
export class ContainsLowercase implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === "string" && hasLowercase(value);
  }
  defaultMessage() {
    return "Password needs at least 1 lowercase letter";
  }
}

@ValidatorConstraint({ name: "containsUppercase", async: false })
export class ContainsUppercase implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === "string" && hasUppercase(value);
  }
  defaultMessage() {
    return "Password needs at least 1 uppercase letter";
  }
}

@ValidatorConstraint({ name: "containsDigit", async: false })
export class ContainsDigit implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === "string" && hasDigit(value);
  }
  defaultMessage() {
    return "Password needs at least 1 number";
  }
}

@ValidatorConstraint({ name: "containsSymbol", async: false })
export class ContainsSymbol implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === "string" && hasSymbol(value);
  }
  defaultMessage() {
    return "Password needs at least 1 symbol";
  }
}
