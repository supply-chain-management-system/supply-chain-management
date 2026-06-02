from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.services.auth.dependancy import get_current_user
from app.models.auth.user import User, UserProfile
from app.schemas.profile import ProfileUpdate, UserProfileOut

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("", response_model=UserProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    company_name = current_user.company.name if current_user.company else None
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value if current_user.role else None,
        "company_name": company_name,
        "profile": profile
    }

@router.patch("", response_model=UserProfileOut)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    update_data = profile_data.dict(exclude_unset=True)
    
    # Restrict role-specific fields
    role_value = current_user.role.value if current_user.role else ""
    if role_value != "business_manager":
        update_data.pop("budget_authority", None)
        update_data.pop("focus_area", None)
    if role_value != "supply_manager":
        update_data.pop("categories_managed", None)
        update_data.pop("supplier_target_score", None)
        update_data.pop("office_extension", None)
        
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    
    company_name = current_user.company.name if current_user.company else None
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role.value if current_user.role else None,
        "company_name": company_name,
        "profile": profile
    }
