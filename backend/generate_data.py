from faker import Faker
from datetime import datetime, timedelta
import random
from database import SessionLocal, engine, Base
from models import Customer, Card, Trip, Case, TapHistory
import string

fake = Faker(['en_US'])

CONFIG = {
    'NUM_CUSTOMERS': 50
}
CARD_TYPES = ["Bank Card", "Account Based Card", "Closed Loop Card"]
CARD_STATUSES = ["ACTIVE", "EXPIRED", "SUSPENDED", "BLOCKED"]
TRANSIT_MODES = ["SubWay", "Bus", "Rail"]
OPERATORS = ["Metro Transit", "City Express", "Urban Connect", "Regional Transport"]
ROUTES = ["Red Line", "Blue Line", "Green Line", "Yellow Line", "Express Route", "Local Route"]
STATIONS = [
    "Central Station", "Airport Terminal", "Downtown", "University",
    "Shopping District", "Sports Complex", "Beach Station", "Business Hub",
    "Entertainment Zone", "Medical Center", "Tech Park", "Cultural District"
]
CASE_STATUSES = ["Open", "In Progress", "Pending", "Resolved", "Closed"]
CASE_PRIORITIES = ["High", "Medium", "Low", "Critical"]
CASE_CATEGORIES = ["Card Issue", "Trip Dispute", "Eligibility Verification", "Refund Request"]
AGENTS = ["James Wilson", "Sarah Chen", "David Brown", "Emily Rodriguez"]
DEVICE_TYPES = ["Reader", "Kiosk", "Gate", "Validator"]
DIRECTIONS = ["Entry", "Exit"]
TAP_RESULTS = ["Success", "Failure", "Timeout"]

TAP_COUNTER = 1

def get_db():
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        db.close()
        raise e

def clear_existing_data(db):
    """Clear all existing data from the tables"""
    print("Clearing existing data...")
    try:
        db.query(TapHistory).delete()
        db.query(Case).delete()
        db.query(Trip).delete()
        db.query(Card).delete()
        db.query(Customer).delete()
        db.commit()
        print("Successfully cleared all existing data.")
    except Exception as e:
        print(f"Error while clearing data: {e}")
        db.rollback()
        raise

def create_customers(count):
    customers = []
    used_names = set()
    used_emails = set()
    
    for i in range(count):
        while True:
            name = fake.name()
            if name not in used_names:
                used_names.add(name)
                break
        
        while True:
            email = fake.email()
            if email not in used_emails:
                used_emails.add(email)
                break
        
        customer = Customer(
            id=f"CUST{str(i+1).zfill(6)}",
            name=name,
            email=email,
            phone=fake.phone_number(),
            notifications="Email Enabled",
            join_date=datetime.now() - timedelta(days=random.randint(0, 365))
        )
        customers.append(customer)
    return customers

def create_cards(customers):
    """Create one card for each customer"""
    cards = []
    for i, customer in enumerate(customers):
        card = Card(
            id=f"4716{str(i+1).zfill(12)}",
            type=random.choice(CARD_TYPES),
            status=random.choice(CARD_STATUSES),
            balance=round(random.uniform(20, 200), 2),
            customer_id=customer.id,
            issue_date=datetime.now() - timedelta(days=random.randint(0, 180))
        )
        cards.append(card)
    return cards

def create_trips(customers, cards):
    """Create 2-4 trips for each card"""
    trips = []
    trip_counter = 1
    print(f"Creating trips for {len(cards)} cards...")
    for i, card in enumerate(cards):
        num_trips = random.randint(2, 4)
        print(f"Card {i+1}/{len(cards)}: {card.id}: {num_trips} trips")
        for _ in range(num_trips):
            start_time = datetime.now() - timedelta(days=random.randint(1, 30), hours=random.randint(1, 23))
            end_time = start_time + timedelta(minutes=random.randint(15, 120))
            entry_loc = random.choice(STATIONS)
            exit_loc = random.choice([s for s in STATIONS if s != entry_loc])
            trip = Trip(
                id=f"T{str(trip_counter).zfill(6)}",
                card_id=card.id,
                start_time=start_time,
                end_time=end_time,
                entry_location=entry_loc,
                exit_location=exit_loc,
                fare=round(random.uniform(2, 25), 2),
                route=random.choice(ROUTES),
                operator=random.choice(OPERATORS),
                transit_mode=random.choice(TRANSIT_MODES),
                adjustable=random.choice(["Yes", "No"])
            )
            trips.append(trip)
            trip_counter += 1
    print(f"Total trips created: {len(trips)}")
    return trips

def create_cases(customers, cards):
    """Create 2-4 cases for each customer (using their card)"""
    cases = []
    case_counter = 1
    for customer in customers:
        card = next(card for card in cards if card.customer_id == customer.id)
        num_cases = random.randint(2, 4)
        for _ in range(num_cases):
            category = random.choice(CASE_CATEGORIES)
            created_date = datetime.now() - timedelta(days=random.randint(1, 30))
            case = Case(
                id=f"CS{str(case_counter).zfill(6)}",
                created_date=created_date,
                last_updated=created_date + timedelta(hours=random.randint(1, 48)),
                customer_id=customer.id,
                card_id=card.id,
                case_status=random.choice(CASE_STATUSES),
                priority=random.choice(CASE_PRIORITIES),
                category=category,
                assigned_agent=random.choice(AGENTS),
                notes=f"Sample case for {category}"
            )
            cases.append(case)
            case_counter += 1
    return cases

def create_tap_history(customers, cards, trips):
    """Create 1-3 tap history entries for each customer (using their card and random trip info)"""
    tap_history = []
    tap_counter = 1
    for customer in customers:
        card = next(card for card in cards if card.customer_id == customer.id)
        customer_trips = [trip for trip in trips if trip.card_id == card.id]
        num_taps = random.randint(1, 3)
        for _ in range(num_taps):
            if customer_trips:
                trip = random.choice(customer_trips)
                tap_time = trip.start_time + timedelta(minutes=random.randint(0, 30))
                location = random.choice([trip.entry_location, trip.exit_location])
                transit_mode = trip.transit_mode
            else:
                tap_time = datetime.now() - timedelta(days=random.randint(1, 30), hours=random.randint(1, 23), minutes=random.randint(0, 59))
                location = random.choice(STATIONS)
                transit_mode = random.choice(TRANSIT_MODES)
            device_type = random.choice(DEVICE_TYPES)
            device_number = random.randint(100, 999)
            tap = TapHistory(
                id=f"TH{str(tap_counter).zfill(6)}",
                tap_time=tap_time,
                location=location,
                device_id=f"{device_type} {device_number}",
                transit_mode=transit_mode,
                direction=random.choice(DIRECTIONS),
                customer_id=customer.id,
                result=random.choice(TAP_RESULTS)
            )
            tap_history.append(tap)
            tap_counter += 1
    return tap_history

def print_statistics(customers, cards, trips, cases, tap_history):
    """Print generation statistics"""
    print("\n=== Data Generation Statistics ===")
    print(f"Total Customers: {len(customers)}")
    print(f"Total Cards: {len(cards)}")
    print(f"Total Trips: {len(trips)}")
    print(f"Total Cases: {len(cases)}")
    print(f"Total Tap History Entries: {len(tap_history)}")
    print(f"Average Trips per Card: {len(trips)/len(cards):.1f}")
    print(f"Average Cases per Customer: {len(cases)/len(customers):.1f}")
    print(f"Average Tap History Entries per Customer: {len(tap_history)/len(customers):.1f}")
    
    card_to_customer = {card.id: card.customer_id for card in cards}
    customers_with_trips = len(set(card_to_customer.get(trip.card_id) for trip in trips if trip.card_id in card_to_customer))
    customers_with_cases = len(set(case.customer_id for case in cases))
    customers_with_tap_history = len(set(tap.customer_id for tap in tap_history))
    
    print(f"\n=== Coverage Statistics ===")
    print(f"Customers with Trips: {customers_with_trips}/{len(customers)} ({customers_with_trips/len(customers)*100:.1f}%)")
    print(f"Customers with Cases: {customers_with_cases}/{len(customers)} ({customers_with_cases/len(customers)*100:.1f}%)")
    print(f"Customers with Tap History: {customers_with_tap_history}/{len(customers)} ({customers_with_tap_history/len(customers)*100:.1f}%)")
    
    if customers_with_trips == len(customers) and customers_with_cases == len(customers) and customers_with_tap_history == len(customers):
        print("\n✅ SUCCESS: All customers have trips, cases, and tap history!")
    else:
        print("\n⚠️  WARNING: Some customers are missing data!")

def main():
    print("\nStarting data generation process...")
    db = get_db()
    
    try:
        Base.metadata.create_all(bind=engine)
        
        clear_existing_data(db)
        
        print(f"\nGenerating {CONFIG['NUM_CUSTOMERS']} customers...")
        customers = create_customers(CONFIG['NUM_CUSTOMERS'])
        db.add_all(customers)
        db.commit()
        
        print("Generating cards...")
        cards = create_cards(customers)
        db.add_all(cards)
        db.commit()
        
        print("Generating trips...")
        trips = create_trips(customers, cards)
        db.add_all(trips)
        db.commit()
        
        print("Generating cases...")
        cases = create_cases(customers, cards)
        db.add_all(cases)
        db.commit()
        
        print("Generating tap history...")
        tap_history = create_tap_history(customers, cards, trips)
        db.add_all(tap_history)
        db.commit()
        
        print_statistics(customers, cards, trips, cases, tap_history)
        
    except Exception as e:
        print(f"Error generating data: {e}")
        db.rollback()
    finally:
        db.close()
        print("\nData generation completed!")

if __name__ == "__main__":
    main() 