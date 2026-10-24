-- Do not repair or round existing data automatically.
BEGIN;
DO $preflight$
BEGIN
  IF EXISTS (SELECT 1 FROM "Transaction" WHERE NOT ("amount" > 0 AND "amount" <= 999999999.99 AND "amount" = trunc("amount", 2))) THEN
    RAISE EXCEPTION 'Existing rows violate Transaction_amount_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
  IF EXISTS (SELECT 1 FROM "Transaction" WHERE NOT ("name" = btrim("name", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("name") BETWEEN 3 AND 50)) THEN
    RAISE EXCEPTION 'Existing rows violate Transaction_name_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
  IF EXISTS (SELECT 1 FROM "Transaction" WHERE NOT (isfinite("timestamp") AND "timestamp" >= TIMESTAMP '1900-01-01 00:00:00')) THEN
    RAISE EXCEPTION 'Existing rows violate Transaction_timestamp_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
  IF EXISTS (SELECT 1 FROM "Budget" WHERE NOT ("max" > 0 AND "max" <= 999999999.99 AND "max" = trunc("max", 2))) THEN
    RAISE EXCEPTION 'Existing rows violate Budget_max_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
  IF EXISTS (SELECT 1 FROM "Budget" WHERE NOT ("name" = btrim("name", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("name") BETWEEN 3 AND 50)) THEN
    RAISE EXCEPTION 'Existing rows violate Budget_name_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
  IF EXISTS (SELECT 1 FROM "TransactionCategory" WHERE NOT ("name" = btrim("name", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("name") BETWEEN 3 AND 50)) THEN
    RAISE EXCEPTION 'Existing rows violate TransactionCategory_name_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
  IF EXISTS (SELECT 1 FROM "TransactionCategory" WHERE NOT ("icon" = btrim("icon", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("icon") BETWEEN 1 AND 32)) THEN
    RAISE EXCEPTION 'Existing rows violate TransactionCategory_icon_valid. Run pnpm db:check-invariants and remediate explicitly before retrying.';
  END IF;
END;
$preflight$;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_valid" CHECK ("amount" > 0 AND "amount" <= 999999999.99 AND "amount" = trunc("amount", 2));
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_name_valid" CHECK ("name" = btrim("name", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("name") BETWEEN 3 AND 50);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_timestamp_valid" CHECK (isfinite("timestamp") AND "timestamp" >= TIMESTAMP '1900-01-01 00:00:00');
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_max_valid" CHECK ("max" > 0 AND "max" <= 999999999.99 AND "max" = trunc("max", 2));
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_name_valid" CHECK ("name" = btrim("name", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("name") BETWEEN 3 AND 50);
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_name_valid" CHECK ("name" = btrim("name", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("name") BETWEEN 3 AND 50);
ALTER TABLE "TransactionCategory" ADD CONSTRAINT "TransactionCategory_icon_valid" CHECK ("icon" = btrim("icon", U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF') AND char_length("icon") BETWEEN 1 AND 32);
COMMIT;
