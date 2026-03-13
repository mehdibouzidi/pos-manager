-- Check the current state of the changeset
SELECT id, author, filename, md5sum, exectype, dateexecuted 
FROM databasechangelog 
WHERE id = 'column_customer_order_service_nb_days';

-- If the changeset failed, delete it so it can be re-run
-- Uncomment the line below after verifying the changeset exists
-- DELETE FROM databasechangelog WHERE id = 'column_customer_order_service_nb_days';

-- Check if there's a lock
SELECT * FROM databasechangeloglock;

-- If locked, clear the lock
-- Uncomment the line below if needed
-- DELETE FROM databasechangeloglock WHERE locked = TRUE;
