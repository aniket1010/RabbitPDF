-- SQL script to delete all records from the database
-- Run this by connecting to the postgres container

-- Delete in order to respect foreign key constraints
DELETE FROM "Message";
DELETE FROM "Conversation";
DELETE FROM "Account";
DELETE FROM "Session";
DELETE FROM "User";
DELETE FROM "Verification";

-- Show counts to verify (all should be 0)
SELECT 'Message' as table_name, COUNT(*) as count FROM "Message"
UNION ALL
SELECT 'Conversation', COUNT(*) FROM "Conversation"
UNION ALL
SELECT 'Account', COUNT(*) FROM "Account"
UNION ALL
SELECT 'Session', COUNT(*) FROM "Session"
UNION ALL
SELECT 'User', COUNT(*) FROM "User"
UNION ALL
SELECT 'Verification', COUNT(*) FROM "Verification";


