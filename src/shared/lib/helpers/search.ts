export const resolveSearch = (term: string, fields: string[]) => {
  const lowerTerm = term.toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(lowerTerm));
};
