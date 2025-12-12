import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'isValidObjectId', async: false })
export class IsValidObjectIdConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    // Allow null or undefined
    if (value === null || value === undefined) return true;
    
    if (typeof value !== 'string') return false;
    
    const trimmed = value.trim();
    // Reject empty strings
    if (trimmed === '') return true;
    // Reject placeholder strings like "string"
    if (trimmed === 'string' || trimmed.length < 24) return false;
    
    return Types.ObjectId.isValid(trimmed);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid MongoDB ObjectId (24-character hex string)`;
  }
}
