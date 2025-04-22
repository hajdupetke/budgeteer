--@param{String} $1:period
--@param{String} $2:startDate
--@param{String} $3:endDate
--@param{String} $4:userId
SELECT 
  DATE_TRUNC($1, "timestamp") as period, 
  SUM(CASE WHEN "type" = 'EXPENSE' THEN "amount" ELSE 0 END) as totalExpense,
  SUM(CASE WHEN "type" = 'INCOME' THEN "amount" ELSE 0 END) as totalIncome
FROM "Transaction" 
WHERE "userId" = $4
AND (DATE($2)::timestamp IS NULL OR "timestamp" >= DATE($2))
AND (DATE($3)::timestamp IS NULL OR "timestamp" <= DATE($3))
GROUP BY period  