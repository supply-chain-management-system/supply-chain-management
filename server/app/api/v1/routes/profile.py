from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.services.auth.dependancy import get_current_user
from app.models.auth.user import User, UserProfile
from app.schemas.profile import ProfileUpdate, UserProfileOut

router = APIRouter(prefix="/profile", tags=["profile"])

def get_role_value(role):
    if role is None:
        return ""
    if hasattr(role, "value"):
        return role.value
    return str(role)

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
    role_val = get_role_value(current_user.role)
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": role_val or "user",
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
    role_value = get_role_value(current_user.role)
    if role_value != "business_manager":
        update_data.pop("budget_authority", None)
        update_data.pop("focus_area", None)
    if role_value != "supply_manager":
        update_data.pop("categories_managed", None)
        update_data.pop("supplier_target_score", None)
        update_data.pop("office_extension", None)
    if role_value != "logistics_manager":
        update_data.pop("fleet_size", None)
        update_data.pop("regions_managed", None)
        update_data.pop("logistics_license_no", None)
        
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    
    company_name = current_user.company.name if current_user.company else None
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": role_value or "user",
        "company_name": company_name,
        "profile": profile
    }
