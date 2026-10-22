import {
  PROFILE_DEFAULT_NAME,
  PROFILE_FALLBACK_NAME,
  resolveGreetingName,
} from '@domain/entities/Profile';

describe('resolveGreetingName', () => {
  it('Halka adı hiç değiştirilmediyse hesap adını kullanır', () => {
    expect(resolveGreetingName('Deniz', PROFILE_DEFAULT_NAME)).toBe('Deniz');
    expect(resolveGreetingName(' Deniz ', '')).toBe('Deniz');
    expect(resolveGreetingName('Deniz', PROFILE_FALLBACK_NAME)).toBe('Deniz');
  });

  it("Halka'da değiştirilen ad hesap adından önce gelir", () => {
    expect(resolveGreetingName('Deniz', 'Kaptan')).toBe('Kaptan');
  });

  it('hesap adı yoksa profil adına düşer', () => {
    expect(resolveGreetingName(null, PROFILE_DEFAULT_NAME)).toBe(PROFILE_DEFAULT_NAME);
    expect(resolveGreetingName(undefined, 'Kaptan')).toBe('Kaptan');
  });
});
