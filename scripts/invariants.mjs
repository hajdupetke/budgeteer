// Keep existing migrations immutable. These predicates also drive the read-only audit.
const whitespace = "U&'\\0009\\000A\\000B\\000C\\000D\\0020\\00A0\\1680\\2000\\2001\\2002\\2003\\2004\\2005\\2006\\2007\\2008\\2009\\200A\\2028\\2029\\202F\\205F\\3000\\FEFF'";
const boundedText = (column, min, max) => `"${column}" = btrim("${column}", ${whitespace}) AND char_length("${column}") BETWEEN ${min} AND ${max}`;
const money = (column) => `"${column}" > 0 AND "${column}" <= 999999999.99 AND "${column}" = trunc("${column}", 2)`;
export const invariants = [
  { table: 'Transaction', name: 'Transaction_amount_valid', predicate: money('amount') },
  { table: 'Transaction', name: 'Transaction_name_valid', predicate: boundedText('name', 3, 50) },
  { table: 'Transaction', name: 'Transaction_timestamp_valid', predicate: 'isfinite("timestamp") AND "timestamp" >= TIMESTAMP \'1900-01-01 00:00:00\'' },
  { table: 'Budget', name: 'Budget_max_valid', predicate: money('max') },
  { table: 'Budget', name: 'Budget_name_valid', predicate: boundedText('name', 3, 50) },
  { table: 'TransactionCategory', name: 'TransactionCategory_name_valid', predicate: boundedText('name', 3, 50) },
  { table: 'TransactionCategory', name: 'TransactionCategory_icon_valid', predicate: boundedText('icon', 1, 32) },
];
