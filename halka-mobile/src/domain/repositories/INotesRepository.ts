// Not defteri repository sözleşmesi
import type { Note } from '@domain/entities/Note';
import type { IEntityRepository } from '@domain/repositories/IEntityRepository';

export type INotesRepository = IEntityRepository<Note>;
