from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.production import Production
from app.models.sales import Sales
from app.models.expenses import Expense

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary/{entry_date}")
def get_daily_summary(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    production = db.query(Production).filter(
        func.date(Production.date) == entry_date
    ).first()

    sales = db.query(Sales).filter(
        func.date(Sales.date) == entry_date
    ).first()

    expenses = db.query(Expense).filter(
        func.date(Expense.date) == entry_date
    ).all()

    total_sales = sales.total_sales if sales else 0
    total_expenses = sum(e.amount for e in expenses)
    net_profit = total_sales - total_expenses

    # Inventory calculation
    open_balance = 0
    pkg_balance = 0
    if production:
        open_sold = 0
        pkg_sold = 0
        if sales:
            open_sold = sales.qty_o1 + sales.qty_o2 + sales.qty_o3
            pkg_sold = sales.qty_p1 + sales.qty_p2 + sales.qty_p3
        open_balance = (
            production.open_produced +
            production.opening_stock - open_sold
        )
        pkg_balance = production.pkg_produced - pkg_sold

    return {
        "date": entry_date,
        "production": {
            "entered": production is not None,
            "batch_number": production.batch_number if production else None,
            "shift": production.shift if production else None,
            "open_produced": production.open_produced if production else 0,
            "pkg_produced": production.pkg_produced if production else 0,
        },
        "sales": {
            "entered": sales is not None,
            "total_sales": total_sales,
        },
        "expenses": {
            "entered": len(expenses) > 0,
            "total_expenses": total_expenses,
        },
        "inventory": {
            "open_balance": open_balance,
            "pkg_balance": pkg_balance,
        },
        "financials": {
            "total_sales": total_sales,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "is_profit": net_profit >= 0,
        }
    }

@router.get("/stats/weekly")
def get_weekly_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    seven_days_ago = today - timedelta(days=7)

    sales_data = db.query(
        func.date(Sales.date).label("date"),
        func.sum(Sales.total_sales).label("total_sales")
    ).filter(
        Sales.date >= seven_days_ago
    ).group_by(func.date(Sales.date)).all()

    expense_data = db.query(
        func.date(Expense.date).label("date"),
        func.sum(Expense.amount).label("total_expenses")
    ).filter(
        Expense.date >= seven_days_ago
    ).group_by(func.date(Expense.date)).all()

    return {
        "period": "last_7_days",
        "sales": [{"date": str(r.date), "total": float(r.total_sales)} for r in sales_data],
        "expenses": [{"date": str(r.date), "total": float(r.total_expenses)} for r in expense_data],
    }