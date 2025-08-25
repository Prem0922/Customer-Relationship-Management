from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import SessionLocal, engine
from models import Customer, Card, Trip, Case, TapHistory, FareDispute
from pydantic import BaseModel, ConfigDict, EmailStr, validator
from fastapi import Body
from sqlalchemy import func
import uuid
import os
import re

router = APIRouter()

API_KEY = os.getenv("API_KEY", "mysecretkey")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

class StandardResponse(BaseModel):
    status: str
    timestamp: datetime
    transactionId: str
    robotRunId: Optional[str] = None
    message: str
    data: Optional[dict] = None

class CardSyncRequest(BaseModel):
    card_id: str
    action: str
    amount: Optional[float] = None
    product: Optional[str] = None
    robotRunId: Optional[str] = None

class CustomerRegisterRequest(BaseModel):
    card_id: str
    customer_id: str
    robotRunId: Optional[str] = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    notifications: str
    
    @validator('email')
    def validate_email_format(cls, v):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    join_date: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CardBase(BaseModel):
    id: str
    type: str
    status: str
    balance: float
    customer_id: str
    issue_date: Optional[datetime] = None

class CardCreate(CardBase):
    pass

class CardUpdate(CardBase):
    pass

class CardResponse(CardBase):
    id: str
    issue_date: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TripBase(BaseModel):
    start_time: datetime
    end_time: datetime
    entry_location: str
    exit_location: str
    fare: float
    route: str
    operator: str
    transit_mode: str
    adjustable: str
    card_id: str

class TripCreate(TripBase):
    id: Optional[str] = None

class TripUpdate(TripBase):
    pass

class TripResponse(TripBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class CaseBase(BaseModel):
    customer_id: str
    card_id: str
    case_status: str
    priority: str
    category: str
    assigned_agent: str
    notes: str

class CaseCreate(CaseBase):
    pass

class CaseUpdate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: str
    created_date: datetime
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)

class TapHistoryBase(BaseModel):
    tap_time: datetime
    location: str
    device_id: str
    transit_mode: str
    direction: str
    customer_id: str
    result: str

class TapHistoryCreate(TapHistoryBase):
    pass

class TapHistoryUpdate(TapHistoryBase):
    pass

class TapHistoryResponse(TapHistoryBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class FareDisputeBase(BaseModel):
    dispute_date: datetime
    card_id: str
    amount: float
    description: str = ""
    trip_id: str
    dispute_type: str

class FareDisputeCreate(FareDisputeBase):
    pass

class FareDisputeResponse(FareDisputeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

@router.get("/customers/", response_model=List[CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    customers = db.query(Customer).offset(skip).limit(limit).all()
    return customers

@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/customers/", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    try:
        existing_customer = db.query(Customer).filter(
            (Customer.email == customer.email) | (Customer.name == customer.name)
        ).first()
        
        if existing_customer:
            raise HTTPException(
                status_code=400, 
                detail=f"Customer with email '{customer.email}' or name '{customer.name}' already exists"
            )
        
        db_customer = Customer(
            id=f"C{str(len(db.query(Customer).all()) + 1).zfill(3)}",
            **customer.dict(),
            join_date=datetime.now()
        )
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")

@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: str, customer: CustomerUpdate, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer.dict().items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

@router.get("/cards/", response_model=List[CardResponse])
def get_cards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    cards = db.query(Card).offset(skip).limit(limit).all()
    return cards

@router.get("/cards/{card_id}", response_model=CardResponse)
def get_card(card_id: str, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

@router.post("/cards/", response_model=CardResponse)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    try:
        existing_card = db.query(Card).filter(Card.id == card.id).first()
        if existing_card:
            raise HTTPException(
                status_code=400, 
                detail=f"Card with ID '{card.id}' already exists"
            )
        
        customer = db.query(Customer).filter(Customer.id == card.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=400, 
                detail=f"Customer with ID '{card.customer_id}' not found"
            )
        
        issue_date = card.issue_date if card.issue_date else datetime.now()
        
        db_card = Card(
            id=card.id,
            type=card.type,
            status=card.status,
            balance=card.balance,
            customer_id=card.customer_id,
            issue_date=issue_date
        )
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create card: {str(e)}")

@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: str, card: CardUpdate, db: Session = Depends(get_db)):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    for key, value in card.dict().items():
        setattr(db_card, key, value)
    
    db.commit()
    db.refresh(db_card)
    return db_card

@router.delete("/cards/{card_id}")
def delete_card(card_id: str, db: Session = Depends(get_db)):
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if db_card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    db.delete(db_card)
    db.commit()
    return {"message": "Card deleted successfully"}

@router.get("/trips/", response_model=List[TripResponse])
def get_trips(skip: int = 0, db: Session = Depends(get_db)):
    trips = db.query(Trip).offset(skip).all()
    return trips

@router.get("/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post("/trips/", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    trip_data = trip.dict()
    trip_id = trip_data.pop('id', None)
    
    if trip_id:
        db_trip = Trip(id=trip_id, **trip_data)
    else:
        db_trip = Trip(
            id=f"T{str(len(db.query(Trip).all()) + 1).zfill(3)}",
            **trip_data
        )
    
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.put("/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: str, trip: TripUpdate, db: Session = Depends(get_db)):
    db_trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    for key, value in trip.dict().items():
        setattr(db_trip, key, value)
    
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.delete("/trips/{trip_id}")
def delete_trip(trip_id: str, db: Session = Depends(get_db)):
    db_trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    db.delete(db_trip)
    db.commit()
    return {"message": "Trip deleted successfully"}

@router.get("/cases/", response_model=List[CaseResponse])
def get_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.created_date.desc()).all()
    return cases

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("/cases/", response_model=CaseResponse)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    db_case = Case(
        id=f"CS{str(len(db.query(Case).all()) + 1).zfill(3)}",
        **case.dict(),
        created_date=datetime.now(),
        last_updated=datetime.now()
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.put("/cases/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, case: CaseUpdate, db: Session = Depends(get_db)):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    
    for key, value in case.dict().items():
        setattr(db_case, key, value)
    
    db.commit()
    db.refresh(db_case)
    return db_case

@router.delete("/cases/{case_id}")
def delete_case(case_id: str, db: Session = Depends(get_db)):
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(db_case)
    db.commit()
    return {"message": "Case deleted successfully"}

@router.get("/tap-history/", response_model=List[TapHistoryResponse])
def get_tap_history(
    skip: int = 0,
    limit: int = 100,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TapHistory)
    if customer_id:
        query = query.filter(TapHistory.customer_id == customer_id)
    tap_history = query.offset(skip).limit(limit).all()
    return tap_history

@router.get("/tap-history/{tap_id}", response_model=TapHistoryResponse)
def get_tap_entry(tap_id: str, db: Session = Depends(get_db)):
    tap_entry = db.query(TapHistory).filter(TapHistory.id == tap_id).first()
    if tap_entry is None:
        raise HTTPException(status_code=404, detail="Tap history entry not found")
    return tap_entry

@router.post("/tap-history/", response_model=TapHistoryResponse)
def create_tap_entry(tap_entry: TapHistoryCreate, db: Session = Depends(get_db)):
    db_tap_entry = TapHistory(
        id=f"TH{str(len(db.query(TapHistory).all()) + 1).zfill(6)}",
        **tap_entry.dict()
    )
    db.add(db_tap_entry)
    db.commit()
    db.refresh(db_tap_entry)
    return db_tap_entry

@router.put("/tap-history/{tap_id}", response_model=TapHistoryResponse)
def update_tap_entry(tap_id: str, tap_entry: TapHistoryUpdate, db: Session = Depends(get_db)):
    db_tap_entry = db.query(TapHistory).filter(TapHistory.id == tap_id).first()
    if db_tap_entry is None:
        raise HTTPException(status_code=404, detail="Tap history entry not found")
    
    for key, value in tap_entry.dict().items():
        setattr(db_tap_entry, key, value)
    
    db.commit()
    db.refresh(db_tap_entry)
    return db_tap_entry

@router.delete("/tap-history/{tap_id}")
def delete_tap_entry(tap_id: str, db: Session = Depends(get_db)):
    db_tap_entry = db.query(TapHistory).filter(TapHistory.id == tap_id).first()
    if db_tap_entry is None:
        raise HTTPException(status_code=404, detail="Tap history entry not found")
    
    db.delete(db_tap_entry)
    db.commit()
    return {"message": "Tap history entry deleted successfully"}

@router.get("/fare-disputes/", response_model=List[FareDisputeResponse])
def get_fare_disputes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    disputes = db.query(FareDispute).offset(skip).limit(limit).all()
    return disputes

@router.post("/fare-disputes/", response_model=FareDisputeResponse)
def create_fare_dispute(dispute: FareDisputeCreate, db: Session = Depends(get_db)):
    db_dispute = FareDispute(
        dispute_date=dispute.dispute_date,
        card_id=dispute.card_id,
        amount=dispute.amount,
        description=dispute.description,
        trip_id=dispute.trip_id,
        dispute_type=dispute.dispute_type
    )
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute

@router.put("/fare-disputes/{dispute_id}", response_model=FareDisputeResponse)
def update_fare_dispute(dispute_id: int, dispute: FareDisputeCreate, db: Session = Depends(get_db)):
    db_dispute = db.query(FareDispute).filter(FareDispute.id == dispute_id).first()
    if db_dispute is None:
        raise HTTPException(status_code=404, detail="Fare Dispute not found")
    for key, value in dispute.dict().items():
        setattr(db_dispute, key, value)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute

@router.delete("/fare-disputes/{dispute_id}")
def delete_fare_dispute(dispute_id: int, db: Session = Depends(get_db)):
    db_dispute = db.query(FareDispute).filter(FareDispute.id == dispute_id).first()
    if db_dispute is None:
        raise HTTPException(status_code=404, detail="Fare Dispute not found")
    db.delete(db_dispute)
    db.commit()
    return {"message": "Fare Dispute deleted successfully"}

class IssueCardRequest(BaseModel):
    card_id: str
    card_type: str
    customer_id: str
    issue_date: str
    balance: float = 0.0
    load_product: Optional[str] = None

@router.post("/api/cards/issue", response_model=StandardResponse)
def issue_card_api(card_data: IssueCardRequest, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        customer = db.query(Customer).filter(Customer.id == card_data.customer_id).first()
        if not customer:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Customer not found",
                data={"customer_id": card_data.customer_id}
            )
        
        existing_card = db.query(Card).filter(Card.id == card_data.card_id).first()
        if existing_card:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Card ID already exists",
                data={"card_id": card_data.card_id}
            )
        
        db_card = Card(
            id=card_data.card_id,
            type=card_data.card_type,
            status="Active",
            balance=card_data.balance,
            product=card_data.load_product if hasattr(card_data, 'load_product') else None,
            customer_id=card_data.customer_id,
            issue_date=datetime.fromisoformat(card_data.issue_date.replace('Z', '+00:00'))
        )
        db.add(db_card)
        
        db.flush()
        
        db.commit()
        
        db.refresh(db_card)
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Card {card_data.card_id} issued successfully",
            data={
                "card_id": db_card.id,
                "type": db_card.type,
                "status": db_card.status,
                "balance": db_card.balance,
                "customer_id": db_card.customer_id,
                "customer_name": customer.name
            }
        )
        
    except Exception as e:
        db.rollback()
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Card issuance failed: {str(e)}",
            data={"card_id": card_data.card_id}
        )

class ProductAddRequest(BaseModel):
    product: str
    value: float = 0.0

@router.post("/api/cards/{card_id}/products", response_model=StandardResponse)
def add_product_api(card_id: str, req: ProductAddRequest, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    """Add a product to a card - POS API endpoint"""
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Card not found",
                data={"card_id": card_id}
            )
        
        if req.value > 0:
            card.balance += req.value
        
        db.commit()
        db.refresh(card)
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Product {req.product} added to card {card_id}",
            data={
                "card_id": card.id,
                "product": card.product,
                "new_balance": card.balance,
                "value_added": req.value
            }
        )
        
    except Exception as e:
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Add product failed: {str(e)}",
            data={"card_id": card_id}
        )

class ReloadRequest(BaseModel):
    amount: float

@router.post("/api/cards/{card_id}/reload", response_model=StandardResponse)
def reload_card_api(card_id: str, req: ReloadRequest, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    """Reload funds onto a card - POS API endpoint"""
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Card not found",
                data={"card_id": card_id}
            )
        
        if req.amount <= 0:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Amount must be positive",
                data={"card_id": card_id, "amount": req.amount}
            )
        
        card.balance += req.amount
        db.commit()
        db.refresh(card)
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Card {card_id} reloaded with ${req.amount}",
            data={
                "card_id": card.id,
                "amount_reloaded": req.amount,
                "new_balance": card.balance,
                "previous_balance": card.balance - req.amount
            }
        )
        
    except Exception as e:
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Reload failed: {str(e)}",
            data={"card_id": card_id}
        )

@router.get("/cards/random")
def get_random_card(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    """Get a random card from the database"""
    import random
    cards = db.query(Card).all()
    if not cards:
        raise HTTPException(status_code=404, detail="No cards found in database")
    
    random_card = random.choice(cards)
    return {
        "id": random_card.id,
        "card_number": random_card.id,
        "balance": random_card.balance,
        "status": random_card.status,
        "type": random_card.type
    }

@router.get("/cards/{card_id}/balance")
def get_card_balance(card_id: str, db: Session = Depends(get_db)):
    """Get card balance"""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return {
        "card_id": card.id,
        "balance": card.balance,
        "status": card.status,
        "type": card.type
    }

@router.post("/cards/issue", response_model=CardResponse)
def issue_card(card_data: IssueCardRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == card_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    existing_card = db.query(Card).filter(Card.id == card_data.card_id).first()
    if existing_card:
        raise HTTPException(status_code=400, detail="Card ID already exists")
    
    db_card = Card(
        id=card_data.card_id,
        type=card_data.card_type,
        status="Active",
        balance=card_data.balance,
        customer_id=card_data.customer_id,
        issue_date=datetime.fromisoformat(card_data.issue_date.replace('Z', '+00:00'))
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.post("/cards/{card_id}/products")
def add_product(card_id: str, req: ProductAddRequest, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if req.value > 0:
        card.balance += req.value
    
    db.commit()
    db.refresh(card)
    return {
        "message": f"Product {req.product} added to card {card_id}",
        "card_id": card.id,
        "new_balance": card.balance
    }

@router.post("/cards/{card_id}/reload")
def reload_card(card_id: str, req: ReloadRequest, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    card.balance += req.amount
    db.commit()
    db.refresh(card)
    return {
        "message": f"Card {card_id} reloaded with ${req.amount}",
        "card_id": card.id,
        "new_balance": card.balance
    }

class PaymentSimRequest(BaseModel):
    card_id: str
    amount: float
    method: str

@router.post("/payment/simulate")
def simulate_payment(req: PaymentSimRequest, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == req.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    if card.balance < req.amount:
        return {
            "success": False,
            "message": "Insufficient balance",
            "current_balance": card.balance,
            "required_amount": req.amount
        }
    
    card.balance -= req.amount
    db.commit()
    db.refresh(card)
    
    return {
        "success": True,
        "message": f"Payment of ${req.amount} by {req.method} successful",
        "card_id": card.id,
        "new_balance": card.balance,
        "payment_method": req.method
    }

@router.get("/cards/{card_id}/transactions")
def get_card_transactions(card_id: str, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    trips = db.query(Trip).filter(Trip.card_id == card_id).order_by(Trip.start_time.desc()).all()
    
    tap_history = db.query(TapHistory).filter(TapHistory.customer_id == card.customer_id).order_by(TapHistory.tap_time.desc()).all()
    
    return {
        "card_id": card_id,
        "card_balance": card.balance,
        "trips": [{
            "trip_id": t.id,
            "start_time": t.start_time,
            "end_time": t.end_time,
            "entry_location": t.entry_location,
            "exit_location": t.exit_location,
            "fare": t.fare,
            "route": t.route,
            "operator": t.operator,
            "transit_mode": t.transit_mode
        } for t in trips],
        "tap_history": [{
            "tap_id": th.id,
            "tap_time": th.tap_time,
            "location": th.location,
            "device_id": th.device_id,
            "transit_mode": th.transit_mode,
            "direction": th.direction,
            "result": th.result
        } for th in tap_history]
    }

@router.get("/reports/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    total_cards = db.query(func.count(Card.id)).scalar()
    total_customers = db.query(func.count(Customer.id)).scalar()
    total_trips = db.query(func.count(Trip.id)).scalar()
    total_balance = db.query(func.sum(Card.balance)).scalar() or 0.0
    total_cases = db.query(func.count(Case.id)).scalar()
    total_tap_entries = db.query(func.count(TapHistory.id)).scalar()
    
    return {
        "total_cards": total_cards,
        "total_customers": total_customers,
        "total_trips": total_trips,
        "total_balance": round(total_balance, 2),
        "total_cases": total_cases,
        "total_tap_entries": total_tap_entries,
        "generated_at": datetime.now().isoformat()
    }

class CardTapRequest(BaseModel):
    card_id: str
    location: str
    device_id: str
    transit_mode: str
    direction: str

@router.post("/simulate/cardTap")
def simulate_card_tap(req: CardTapRequest, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == req.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    min_fare = 2.50
    if card.balance < min_fare:
        result = "Insufficient Balance"
    else:
        result = "Tap Successful"
        card.balance -= min_fare
    
    tap_entry = TapHistory(
        id=f"TH{str(len(db.query(TapHistory).all()) + 1).zfill(6)}",
        tap_time=datetime.now(),
        location=req.location,
        device_id=req.device_id,
        transit_mode=req.transit_mode,
        direction=req.direction,
        customer_id=card.customer_id,
        result=result
    )
    
    db.add(tap_entry)
    db.commit()
    db.refresh(tap_entry)
    
    return {
        "tap_id": tap_entry.id,
        "card_id": req.card_id,
        "result": result,
        "location": req.location,
        "transit_mode": req.transit_mode,
        "direction": req.direction,
        "remaining_balance": card.balance,
        "tap_time": tap_entry.tap_time.isoformat()
    }

@router.post("/api/crm/cards/sync", response_model=StandardResponse)
def sync_card_to_crm(req: CardSyncRequest, db: Session = Depends(get_db)):
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        card = db.query(Card).filter(Card.id == req.card_id).first()
        if not card:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                robotRunId=req.robotRunId,
                message="Card not found in CRM",
                data={"card_id": req.card_id}
            )
        
        if req.action == "reload" and req.amount:
            card.balance += req.amount
            message = f"Card {req.card_id} reloaded with ${req.amount}"
        elif req.action == "add_product" and req.product:
            card.product = req.product
            if req.amount:
                card.balance += req.amount
            message = f"Product {req.product} added to card {req.card_id}"
        else:
            message = f"Card {req.card_id} synced successfully"
        
        db.commit()
        db.refresh(card)
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            robotRunId=req.robotRunId,
            message=message,
            data={
                "card_id": card.id,
                "balance": card.balance,
                "status": card.status,
                "product": card.product
            }
        )
        
    except Exception as e:
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            robotRunId=req.robotRunId,
            message=f"Sync failed: {str(e)}",
            data={"card_id": req.card_id}
        )

@router.post("/api/crm/customers/{customer_id}/register", response_model=StandardResponse)
def register_card_to_customer(customer_id: str, req: CustomerRegisterRequest, db: Session = Depends(get_db)):
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                robotRunId=req.robotRunId,
                message="Customer not found",
                data={"customer_id": customer_id}
            )
        
        card = db.query(Card).filter(Card.id == req.card_id).first()
        if not card:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                robotRunId=req.robotRunId,
                message="Card not found",
                data={"card_id": req.card_id}
            )
        
        card.customer_id = customer_id
        db.commit()
        db.refresh(card)
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            robotRunId=req.robotRunId,
            message=f"Card {req.card_id} registered to customer {customer_id}",
            data={
                "card_id": card.id,
                "customer_id": customer_id,
                "customer_name": customer.name,
                "card_status": card.status
            }
        )
        
    except Exception as e:
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            robotRunId=req.robotRunId,
            message=f"Registration failed: {str(e)}",
            data={"card_id": req.card_id, "customer_id": customer_id}
        )

@router.get("/api/crm/cards/{card_id}", response_model=StandardResponse)
def get_crm_card_status(card_id: str, db: Session = Depends(get_db)):
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Card not found",
                data={"card_id": card_id}
            )
        
        customer = db.query(Customer).filter(Customer.id == card.customer_id).first()
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            message="Card status retrieved successfully",
            data={
                "card_id": card.id,
                "balance": card.balance,
                "status": card.status,
                "type": card.type,
                "product": card.product,
                "issue_date": card.issue_date.isoformat(),
                "customer_id": card.customer_id,
                "customer_name": customer.name if customer else None
            }
        )
        
    except Exception as e:
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Failed to get card status: {str(e)}",
            data={"card_id": card_id}
        )

@router.get("/api/crm/customers/{customer_id}", response_model=StandardResponse)
def get_crm_customer_status(customer_id: str, db: Session = Depends(get_db)):
    transaction_id = str(uuid.uuid4())
    timestamp = datetime.now()
    
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return StandardResponse(
                status="error",
                timestamp=timestamp,
                transactionId=transaction_id,
                message="Customer not found",
                data={"customer_id": customer_id}
            )
        
        cards = db.query(Card).filter(Card.customer_id == customer_id).all()
        
        return StandardResponse(
            status="success",
            timestamp=timestamp,
            transactionId=transaction_id,
            message="Customer status retrieved successfully",
            data={
                "customer_id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "address": customer.address,
                "join_date": customer.join_date.isoformat(),
                "cards": [{
                    "card_id": card.id,
                    "balance": card.balance,
                    "status": card.status,
                    "type": card.type,
                    "product": card.product
                } for card in cards],
                "total_cards": len(cards),
                "total_balance": sum(card.balance for card in cards)
            }
        )
        
    except Exception as e:
        return StandardResponse(
            status="error",
            timestamp=timestamp,
            transactionId=transaction_id,
            message=f"Failed to get customer status: {str(e)}",
            data={"customer_id": customer_id}
        ) 