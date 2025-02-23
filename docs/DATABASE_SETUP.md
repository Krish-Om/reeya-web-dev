# Database Setup Guide for macOS

This guide will help you set up PostgreSQL for the Job Board application on your local macOS machine.

## Installing PostgreSQL

### Using Homebrew (Recommended)

1. Install Homebrew if you haven't already:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install PostgreSQL:
```bash
brew install postgresql@14
```

3. Start PostgreSQL service:
```bash
brew services start postgresql@14
```

### Manual Installation

Alternatively, you can download the PostgreSQL installer from the official website:
1. Visit [PostgreSQL Downloads](https://www.postgresql.org/download/macosx/)
2. Download and run the installer for macOS
3. Follow the installation wizard

## Database Setup

1. Create a new database:
```bash
createdb jobboard
```

2. Create a new user (replace `your_username` and `your_password`):
```bash
createuser -P your_username
psql jobboard
ALTER USER your_username WITH SUPERUSER;
```

## Environment Configuration

1. Create a `.env` file in your project root:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/jobboard
SESSION_SECRET=your_random_secret_key
```

Make sure to replace:
- `your_username`: Your PostgreSQL username
- `your_password`: Your PostgreSQL password
- `your_random_secret_key`: A random string for session encryption

## Verifying Installation

1. Connect to your database:
```bash
psql jobboard
```

2. List all databases:
```sql
\l
```

3. List all tables (after running migrations):
```sql
\dt
```

## Running Migrations

After setting up the database and environment variables:

```bash
npm run db:push
```

This will create all necessary tables in your database.

## Common Issues and Solutions

### Connection Refused

If you see "connection refused" errors:
1. Check if PostgreSQL is running:
```bash
brew services list
```
2. Restart PostgreSQL if needed:
```bash
brew services restart postgresql@14
```

### Port Already in Use

If port 5432 is already in use:
1. Check what's using the port:
```bash
lsof -i :5432
```
2. Stop the conflicting process or change the PostgreSQL port in your connection string

### Permission Issues

If you encounter permission errors:
1. Check your user privileges:
```sql
\du
```
2. Grant necessary privileges:
```sql
ALTER USER your_username WITH SUPERUSER;
```

## Development Tips

1. **GUI Tools**: Consider using [pgAdmin](https://www.pgadmin.org/) or [Postico](https://eggerapps.at/postico/) for easier database management

2. **Backup**: Regular backups
```bash
pg_dump jobboard > backup.sql
```

3. **Restore**: Restore from backup
```bash
psql jobboard < backup.sql
```

## Monitoring

To monitor your database:
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT pg_size_pretty(pg_total_relation_size('table_name'));
```

## Security Best Practices

1. Use strong passwords
2. Regularly update PostgreSQL
3. Limit network access in pg_hba.conf
4. Use environment variables for sensitive data
5. Never commit .env files to version control

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Homebrew PostgreSQL Formula](https://formulae.brew.sh/formula/postgresql)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
