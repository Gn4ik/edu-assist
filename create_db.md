```psql
sudo -u postgres psql
```

```psql
postgres=# CREATE USER eduassist WITH PASSWORD=
postgres-# ^C
postgres=# CREATE USER eduassist WITH PASSWORD '88005553535';
CREATE ROLE
postgres=# CREATE DATABASE eduassist OWNER eduassist;
CREATE DATABASE
postgres=# GRANT ALL PRIVELEGES ON DATABASE eduassist TO eduassist;
ERROR:  syntax error at or near "PRIVELEGES"
LINE 1: GRANT ALL PRIVELEGES ON DATABASE eduassist TO eduassist;
                  ^
postgres=# GRANT ALL PRIViLEGES ON DATABASE eduassist TO eduassist;
GRANT





postgres=# \c eduassist
You are now connected to database "eduassist" as user "postgres".
eduassist=# GRANT ALL ON SCHEMA public TO eduassist;
GRANT
eduassist=# GRANT CREATE ON SCHEMA public TO eduassist;
GRANT
eduassist=# 
```