"""Encrypt-at-rest helper for secrets we must persist (currently: Google
Calendar OAuth tokens). Uses Fernet (symmetric, authenticated encryption)
keyed by TOKEN_ENCRYPTION_KEY, kept out of source control in .env.
"""
from cryptography.fernet import Fernet, InvalidToken
from app.config import settings


def _fernet() -> Fernet:
    key = settings.TOKEN_ENCRYPTION_KEY
    if not key:
        raise RuntimeError(
            "TOKEN_ENCRYPTION_KEY is not set — generate one with "
            "`python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"` "
            "and add it to backend/.env before connecting Google Calendar."
        )
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_value(value: str) -> str:
    if value is None:
        return None
    return _fernet().encrypt(value.encode()).decode()


def decrypt_value(token: str) -> str:
    if token is None:
        return None
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken:
        raise RuntimeError("Stored Google Calendar token could not be decrypted — TOKEN_ENCRYPTION_KEY may have changed.")
