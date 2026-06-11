import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Schema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: Schema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        details[path] = issue.message;
      }
      throw new BadRequestException({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body failed validation',
          details,
        },
      });
    }
    return result.data;
  }
}
