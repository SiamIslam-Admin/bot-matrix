from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.auth import hash_password, verify_password, create_access_token
from backend.config import DEFAULT_POINTS

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.AccountOut)
def register(payload: schemas.AccountCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Account).filter(models.Account.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    account = models.Account(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        points=DEFAULT_POINTS,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.email == form_data.username).first()
    if not account or not verify_password(form_data.password, account.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": str(account.id)})
    return {"access_token": token, "token_type": "bearer"}
