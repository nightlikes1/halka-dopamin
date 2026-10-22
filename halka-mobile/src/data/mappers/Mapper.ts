// DTO <-> Entity dönüşüm sözleşmesi
export interface Mapper<TDto, TEntity> {
  toEntity(dto: TDto): TEntity;
  toDto(entity: TEntity): TDto;
}
