INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        user_type,
        is_active,
        is_verified,
        verification_status,
        verification_notes,
        verified_at
    )
VALUES (
        'admin@vigilux.app',
        '$2b$12$.YFYqbT51tL.aMuiB6/23e4IMS7/JA4XB.snV5iP2EjRVMyd..o4W',
        'Admin',
        'User',
        'admin',
        TRUE,
        TRUE,
        'approved',
        'Seeded admin account',
        CURRENT_TIMESTAMP
    ) ON CONFLICT (email) DO
UPDATE
SET user_type = 'admin',
    is_active = TRUE,
    is_verified = TRUE,
    verification_status = 'approved',
    verification_notes = 'Seeded admin account',
    verified_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;