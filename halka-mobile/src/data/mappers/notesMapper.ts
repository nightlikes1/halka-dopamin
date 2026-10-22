// Not DTO <-> Entity
import type { NotesDto } from '@data/dto/HalkaStorageDto';
import type { Mapper } from '@data/mappers/Mapper';
import type { Note } from '@domain/entities/Note';

export const notesMapper: Mapper<NotesDto, Note> = {
  toEntity: (dto) => ({ content: dto.content }),
  toDto: (entity) => ({ content: entity.content }),
};
