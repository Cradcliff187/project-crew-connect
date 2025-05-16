# Financial Entity-Relationship Diagram

Below is an entity-relationship diagram showing the relationships between all finance-related tables in the application.

```mermaid
erDiagram
    CUSTOMERS ||--o{ ESTIMATES : "has"
    CUSTOMERS ||--o{ PROJECTS : "has"
    ESTIMATES ||--o{ ESTIMATE_REVISIONS : "has"
    ESTIMATE_REVISIONS ||--o{ ESTIMATE_ITEMS : "contains"
    ESTIMATES ||--o| PROJECTS : "converts to"
    PROJECTS ||--o{ PROJECT_BUDGET_ITEMS : "has"
    ESTIMATE_ITEMS ||--o| PROJECT_BUDGET_ITEMS : "becomes"
    PROJECTS ||--o{ WORK_ORDERS : "has"
    PROJECTS ||--o{ CHANGE_ORDERS : "has"
    WORK_ORDERS ||--o{ CHANGE_ORDERS : "has"
    CHANGE_ORDERS ||--o{ CHANGE_ORDER_ITEMS : "contains"
    PROJECTS ||--o{ TIME_ENTRIES : "has"
    WORK_ORDERS ||--o{ TIME_ENTRIES : "has"
    EMPLOYEES ||--o{ TIME_ENTRIES : "has"
    PROJECT_BUDGET_ITEMS ||--o| TIME_ENTRIES : "linked to"
    VENDORS ||--o{ ESTIMATE_ITEMS : "referenced by"
    VENDORS ||--o{ PROJECT_BUDGET_ITEMS : "referenced by"
    SUBCONTRACTORS ||--o{ ESTIMATE_ITEMS : "referenced by"
    SUBCONTRACTORS ||--o{ PROJECT_BUDGET_ITEMS : "referenced by"
    DOCUMENTS ||--o{ ESTIMATES : "attached to"
    DOCUMENTS ||--o{ ESTIMATE_ITEMS : "attached to"
    DOCUMENTS ||--o{ PROJECTS : "attached to"

    CUSTOMERS {
        string customerid PK
        string customername
        string address
        string city
        string state
        string zip
        string contactemail
        string phone
        string status
    }

    ESTIMATES {
        string estimateid PK
        string customerid FK
        string projectname
        string status
        number estimateamount
        number contingencyamount
        string projectid FK
        date approveddate
        date sentdate
    }

    ESTIMATE_REVISIONS {
        string id PK
        string estimate_id FK
        number version
        number amount
        boolean is_selected_for_view
    }

    ESTIMATE_ITEMS {
        string id PK
        string revision_id FK
        string description
        string item_type
        number quantity
        number cost
        number markup_percentage
        number markup_amount
        number unit_price
        number total_price
        string vendor_id FK
        string subcontractor_id FK
        string document_id FK
    }

    PROJECTS {
        string projectid PK
        string customerid FK
        string projectname
        string status
        number total_budget
        number current_expenses
        number contract_value
        number original_base_cost
        number original_selling_price
        number original_contingency_amount
        string budget_status
    }

    PROJECT_BUDGET_ITEMS {
        string id PK
        string project_id FK
        string category
        string description
        number estimated_amount
        number actual_amount
        number estimated_cost
        number base_cost
        number selling_unit_price
        number markup_percentage
        number markup_amount
        number selling_total_price
        number gross_margin_percentage
        number gross_margin_amount
        number quantity
        string vendor_id FK
        string subcontractor_id FK
        string estimate_item_origin_id FK
    }

    CHANGE_ORDERS {
        string id PK
        string entity_id FK
        string entity_type
        string title
        string description
        string status
        number revenue_impact
        number cost_impact
        date created_at
        date updated_at
    }

    CHANGE_ORDER_ITEMS {
        string id PK
        string change_order_id FK
        string description
        number cost
        number price
        number gross_margin
        number gross_margin_percentage
    }

    WORK_ORDERS {
        string id PK
        string project_id FK
        string title
        string description
        number time_estimate
        number actual_hours
        number materials_cost
        number total_cost
        number expenses_cost
        number labor_cost
    }

    TIME_ENTRIES {
        string id PK
        string project_id FK
        string work_order_id FK
        string employee_id FK
        number hours
        number cost_rate
        number total_cost
        string project_budget_item_id FK
    }

    EMPLOYEES {
        string employee_id PK
        string first_name
        string last_name
        string email
        string role
        number hourly_rate
    }

    VENDORS {
        string id PK
        string vendorname
    }

    SUBCONTRACTORS {
        string id PK
        string subname
    }

    DOCUMENTS {
        string document_id PK
        string entity_type
        string entity_id
        string storage_path
        string file_name
        string category
    }
```

Note: This ERD represents a comprehensive view of all finance-related tables and their relationships based on our codebase analysis. Some fields and relationships may be simplified or inferred.
