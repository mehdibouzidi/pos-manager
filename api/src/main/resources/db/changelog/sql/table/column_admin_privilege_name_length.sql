--- ChangeSet modify-name-column-size
ALTER TABLE admin.admin_privileges
ALTER COLUMN name TYPE VARCHAR(255);