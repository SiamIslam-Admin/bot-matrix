from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models
from backend.auth import get_current_account

router = APIRouter(prefix="/api/points", tags=["points"])


@router.get("")
def get_points(account: models.Account = Depends(get_current_account)):
    return {"points": account.points}


@router.post("/grant")
def grant_points(amount: int, db: Session = Depends(get_db), account: models.Account = Depends(get_current_account)):
    account.points += amount
    db.commit()
    return {"points": account.points}
