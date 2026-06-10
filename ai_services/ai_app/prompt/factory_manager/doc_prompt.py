


def doc_prompt(data:dict):
    if not data or not data.get("production_name"):
        return "Error: Missing production data"

    team_str = "\n".join([f"- {m['name']} ({m['role']})" for m in data.get("assigned_team", [])]) or "None"
    machines_str = "\n".join([f"- {m['name']} [{m['machine_code'] or 'MC-XXXX'}] (Eff: {m['efficiency']}%, Loc: {m['location']})" for m in data.get("assigned_machinery", [])]) or "None"
    materials_str = "\n".join([f"- {m['material_name']}: {m['quantity']} {m['unit']}" for m in data.get("consumed_materials", [])]) or "None"

    prompt = f"""
You are a senior manufacturing operations analyst working for a supply chain enterprise.

Your task is to generate a highly professional, comprehensive production completion report.

The report must be structured, concise, and business-ready.

----------------------------
PRODUCTION DATA
----------------------------
- Production Job ID: #{data.get("production_id")}
- Product Name: {data.get("production_name")}
- Target Qty: {data.get("target_qty")} units
- Output Qty: {data.get("output_qty")} units
- Scrap Qty: {data.get("scrap_qty")} units
- Priority: {data.get("priority")}
- Notes: {data.get("notes")}
- Created At: {data.get("created_at")}

----------------------------
ASSIGNED RESOURCES
----------------------------
Workforce Team:
{team_str}

Machinery Assigned:
{machines_str}

Consumed Raw Materials:
{materials_str}

----------------------------
REQUIRED FORMAT
----------------------------

1. Production Summary
- Brief overview of the production run, objective, and general notes.

2. Efficiency & Yield Analysis
- Compare target vs actual output.
- Analyze the scrap rate relative to the output.
- Highlight calculated efficiency percentage.

3. Resource & Equipment Assessment
- Assess machinery efficiency performance based on the specific assigned machines.
- Assess labor productivity and allocation.

4. Consumed Materials Audit
- Review raw materials consumed and determine if usage aligns with standard recipe metrics.

5. Issues & Observations
- Machine downtime or warning signs.
- Material wastage / scrap rate analysis.
- Operational delays.

6. Recommendations
- Tactical improvements for the next production cycle.
- Long-term cost optimization suggestions.

7. Final Conclusion
- Overall performance verdict (Excellent / Good / Average / Poor)

----------------------------
RULES
----------------------------
- Be professional, structured, and objective.
- Use bullet points where appropriate.
- Focus strictly on factory decision-making insights.
"""
    return prompt