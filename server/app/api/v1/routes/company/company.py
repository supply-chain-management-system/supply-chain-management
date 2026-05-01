from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.company.company import CompanySetupSchema
from app.services.company.company_service import setup_company
from app.services.auth.dependancy import require_role
from app.models.auth.user import User

router = APIRouter()


@router.post("/setup")
def create_company(
    data: CompanySetupSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["owner"])),
):
    return setup_company(db, data, current_user)
