


def doc_prompt(data:dict):
    if not data or not data.get("production_name"):
        return "Error: Missing production data"
    prompt = f"""
You are a senior manufacturing operations analyst working for a supply chain enterprise.

Your task is to generate a highly professional production completion report.

The report must be structured, concise, and business-ready.

----------------------------
PRODUCTION DATA
----------------------------
{data}

----------------------------
REQUIRED FORMAT
----------------------------

1. Production Summary
- Brief overview of production run

2. Efficiency Analysis
- Compare target vs actual output
- Highlight efficiency percentage if possible

3. Issues & Observations
- Machine downtime
- Material wastage
- Operational delays

4. Recommendations
- Improvements for next production cycle
- Cost optimization suggestions

5. Final Conclusion
- Overall performance verdict (Excellent / Good / Average / Poor)

----------------------------
RULES
----------------------------
- Be professional and structured
- Use bullet points
- Do not add unnecessary explanation
- Focus on factory decision-making insights
"""
    
    return prompt