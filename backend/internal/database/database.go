package database

import (
    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

func Connect(databaseURL string) (*sqlx.DB, error) {
    db, err := sqlx.Connect("postgres", databaseURL)
    if err != nil {
        return nil, err
    }

    if err = db.Ping(); err != nil {
        return nil, err
    }

    return db, nil
}