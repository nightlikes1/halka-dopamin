// Form doğrulama şemaları (react-hook-form + zod)
import { z } from 'zod';
import { EXPENSE_LABEL_MAX_LENGTH, EXPENSE_MAX_AMOUNT } from '@domain/entities/Budget';
import { TASK_TEXT_MAX_LENGTH } from '@domain/entities/Task';

export const taskFormSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Görev boş olamaz.')
    .max(TASK_TEXT_MAX_LENGTH, `En fazla ${TASK_TEXT_MAX_LENGTH} karakter.`),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;

// Türkçe klavyedeki virgülü de ondalık ayırıcı kabul eder
export const parseAmount = (value: string): number => Number(value.trim().replace(',', '.'));

export const expenseFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Tutar gir.')
    .refine((value) => {
      const amount = parseAmount(value);
      return Number.isFinite(amount) && amount > 0 && amount <= EXPENSE_MAX_AMOUNT;
    }, 'Geçerli bir tutar gir.'),
  label: z
    .string()
    .trim()
    .max(EXPENSE_LABEL_MAX_LENGTH, `En fazla ${EXPENSE_LABEL_MAX_LENGTH} karakter.`),
});
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// Tek alanlı metin diyaloğu (isim, hedef vb.)
export function createTextDialogSchema(maxLength: number, emptyMessage: string) {
  return z.object({
    value: z.string().trim().min(1, emptyMessage).max(maxLength, `En fazla ${maxLength} karakter.`),
  });
}
export type TextDialogValues = z.infer<ReturnType<typeof createTextDialogSchema>>;
