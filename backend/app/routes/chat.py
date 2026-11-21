"""
Chatbot API Router
Provides knowledge retrieval and conversational responses for Lunar Space AI,
lunar geology, polar ice volatiles, and space exploration missions.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import time
import re

from app.schemas.schemas import StandardResponse

router = APIRouter(prefix="/api/chat", tags=["Lunar AI Assistant"])

class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = Field(default_factory=list)

class ChatResponseData(BaseModel):
    reply: str
    sources: List[str]
    suggested_followups: List[str]
    latency_ms: float

KNOWLEDGE_BASE = [
    {
        "keywords": ["what is lunar space ai", "project overview", "about lunar space ai", "what does this project do"],
        "reply": (
            "**Lunar Space AI** is an advanced autonomous planetary cartography and mission intelligence platform "
            "designed for next-generation lunar exploration.\n\n"
            "### Core Capabilities:\n"
            "• **Optical Surface Intelligence**: Sub-pixel crater segmentation and boulder hazard classification via OpenCV.\n"
            "• **Polar Water-Ice Detection**: Multi-spectral modeling of Permanently Shadowed Regions (PSRs) and thermal cold traps.\n"
            "• **Autonomous Rover Navigation**: A* global trajectory planning combined with sub-5ms D* Lite incremental dynamic replanning.\n"
            "• **Orbital Telemetry Synchronizer**: Multi-mission composite feeds from NASA's LRO, ISRO's Chandrayaan-2, and JAXA's Kaguya."
        ),
        "sources": ["LRO-NAC Mission Specs", "Lunar Space AI Architecture Whitepaper", "Autonomous Systems Lab"],
        "followups": ["How does this project work?", "Tell me about lunar ice.", "How does AI help in lunar exploration?"]
    },
    {
        "keywords": ["how does this project work", "how does it work", "workflow", "architecture", "pipeline"],
        "reply": (
            "**Lunar Space AI operates through a 5-stage automated pipeline**:\n\n"
            "1. **Orbital & Surface Ingestion**: Raw narrow-angle camera (LRO-NAC) mosaics and topographic elevation matrices are loaded.\n"
            "2. **Computer Vision & Hazard Segmentation**: OpenCV filters detect impact craters, boulders, and steep elevation drops.\n"
            "3. **Cost Map Synthesis**: A 2D cost matrix is generated where slopes > 22° and boulders are designated impassable ($1000.0$ cost).\n"
            "4. **A* Global Trajectory**: An optimal energy-efficient route is plotted with octile heuristics between landing zone and scientific targets.\n"
            "5. **Sensor Horizon & D* Lite Replanning**: When unexpected obstacles appear within 6m of the rover, D* Lite calculates an avoidance route in under 5ms without recomputing the entire global map."
        ),
        "sources": ["Lunar Rover AI Engineering Guide", "A* & D* Lite Kinematic Spec"],
        "followups": ["Explain the lunar surface analysis.", "What is the tech stack?", "What are the major Moon missions?"]
    },
    {
        "keywords": ["tech stack", "technology stack", "framework", "built with", "backend", "frontend"],
        "reply": (
            "**Lunar Space AI is engineered with a modern high-performance stack**:\n\n"
            "• **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Bits (`<TechText />`), and Recharts.\n"
            "• **Backend API**: Python 3.13, FastAPI with asynchronous ASGI endpoints, and Pydantic v2 validation.\n"
            "• **Computer Vision & Math**: OpenCV 5.0, NumPy, NetworkX, and SciPy for elevation gradients and graph pathfinding.\n"
            "• **Navigation Engine**: Deterministic 8-connected A* search, D* Lite incremental replanner, and line-of-sight path smoothers.\n"
            "• **Database**: SQLite with SQLAlchemy ORM for mission analysis logs and terrain reports."
        ),
        "sources": ["PROJECT_ROADMAP.md", "system_architecture.md"],
        "followups": ["How does AI help in lunar exploration?", "What is Lunar Space AI?"]
    },
    {
        "keywords": ["lunar ice", "water on the moon", "water ice", "ice reserves", "cold trap", "permanently shadowed", "psr"],
        "reply": (
            "**Water-Ice on the Moon** represents one of the most critical resources for sustainable space exploration:\n\n"
            "• **Location**: Concentrated primarily in **Permanently Shadowed Regions (PSRs)** within deep polar impact craters (e.g., Shackleton, Faustini, Shoemaker at 89.9°S).\n"
            "• **Thermal Cold Traps**: Because the Moon's axial tilt is only 1.54°, the Sun never crests the rims of polar craters. Interior temperatures plummet below **40 to 90 Kelvin (-233°C)**, preserving volatiles for over 2 billion years.\n"
            "• **Estimated Quantity**: Orbital radar (LRO Mini-RF, Chandrayaan-1 Mini-SAR) estimates upwards of **600 million metric tons** of water ice.\n"
            "• **In-Situ Resource Utilization (ISRU)**: This ice can be harvested and electrolyzed into liquid hydrogen ($H_2$) and liquid oxygen ($O_2$) for rocket propellant and life support."
        ),
        "sources": ["NASA LRO Diviner Radiometer", "ISRO Chandrayaan-1 M3 Science Archive"],
        "followups": ["What is Lunar Space AI?", "What are the major Moon missions?", "Explain the lunar surface analysis."]
    },
    {
        "keywords": ["how does ai help", "ai in space", "ai role", "machine learning", "why ai"],
        "reply": (
            "**Artificial Intelligence fundamentally transforms lunar surface operations** in three vital ways:\n\n"
            "• **Autonomous Hazard Avoidance**: Due to the 2.5-second round-trip radio communication latency between Earth and the Moon, real-time rover driving from Earth is hazardous. Onboard AI enables real-time obstacle avoidance without human intervention.\n"
            "• **Automated Crater & Boulder Segmentation**: AI analyzes thousands of square kilometers of high-resolution satellite imagery in seconds, mapping boulder distributions that would take human cartographers months.\n"
            "• **Energy-Optimized Trajectory Replanning**: Deep learning and heuristic cost maps compute optimal routes that balance battery consumption, slope angles, and solar exposure windows."
        ),
        "sources": ["NASA Autonomous Systems Initiative", "Lunar Rover AI Architecture"],
        "followups": ["Explain the lunar surface analysis.", "What is Lunar Space AI?", "Tell me about lunar ice."]
    },
    {
        "keywords": ["major moon missions", "moon missions", "chandrayaan", "apollo", "artemis", "missions"],
        "reply": (
            "**Key Historic & Modern Lunar Missions**:\n\n"
            "• **Apollo Program (1969–1972)**: NASA landed 12 astronauts on the lunar nearside, returning 382 kg of lunar rocks and regolith.\n"
            "• **Lunar Reconnaissance Orbiter (LRO, 2009–Present)**: Captured global 0.5m/pixel optical maps (LRO-NAC) and laser altimetry (LOLA) that power our cartography.\n"
            "• **Chandrayaan-1 (2008)**: Confirmed the presence of water molecules on the lunar surface via the Moon Mineralogy Mapper (M3).\n"
            "• **Chandrayaan-3 (2023)**: Historic soft landing near the lunar South Pole; Pragyan rover conducted in-situ laser-induced breakdown spectroscopy, detecting sulfur, iron, and aluminum.\n"
            "• **Artemis Program (Ongoing)**: NASA and international partners plan crewed polar landings, the Lunar Gateway space station, and commercial lunar payload deliveries."
        ),
        "sources": ["ISRO Chandrayaan Telemetry Archive", "NASA Planetary Data System (PDS)"],
        "followups": ["Tell me about lunar ice.", "What is Lunar Space AI?", "How does this project work?"]
    },
    {
        "keywords": ["surface analysis", "lunar surface", "crater analysis", "geology", "regolith", "landing score"],
        "reply": (
            "**Lunar Surface Analysis in Lunar Space AI assesses terrain safety using three criteria**:\n\n"
            "1. **Crater & Depression Detection**: Edge gradient convolutions identify crater rims and shadow depths.\n"
            "2. **Slope Gradient Estimation**: Calculates topographic slope angles. Slopes below 14° are safe for roving, 14°–22° incur energy penalties, and slopes above 22° represent tip-over hazards.\n"
            "3. **Composite Touchdown Score (0–100%)**: Evaluates surface flatness, boulder clearance density, and regolith bearing strength to guide autonomous landing craft."
        ),
        "sources": ["Lunar Terrain Analysis Engine", "OpenCV Topographic Segmentation"],
        "followups": ["How does this project work?", "Tell me about lunar ice.", "What is Lunar Space AI?"]
    }
]

def find_best_response(user_query: str) -> Dict[str, Any]:
    cleaned = user_query.lower().strip()
    
    # Check exact/partial keyword matches
    for item in KNOWLEDGE_BASE:
        for kw in item["keywords"]:
            if kw in cleaned or re.search(r'\b' + re.escape(kw) + r'\b', cleaned):
                return item

    # Word intersection scoring
    query_words = set(re.findall(r'\w+', cleaned))
    best_item = None
    best_score = 0

    for item in KNOWLEDGE_BASE:
        score = 0
        for kw in item["keywords"]:
            kw_words = set(re.findall(r'\w+', kw))
            match_count = len(query_words.intersection(kw_words))
            if match_count > score:
                score = match_count
        if score > best_score and score >= 2:
            best_score = score
            best_item = item

    if best_item:
        return best_item

    # Polite out-of-scope fallback
    return {
        "reply": (
            "I specialize specifically in **lunar science, Moon exploration, and the Lunar Space AI platform**.\n\n"
            "I would be glad to help you with:\n"
            "• **Lunar Space AI Project**: Architecture, tech stack, and algorithms\n"
            "• **Lunar Science**: Geology, polar water-ice, and permanently shadowed craters\n"
            "• **Exploration Missions**: Chandrayaan, Apollo, LRO, and Artemis\n"
            "• **Autonomous Systems**: OpenCV hazard detection and A*/D* Lite rover navigation\n\n"
            "What would you like to explore regarding the Moon?"
        ),
        "sources": ["Lunar Space AI Knowledge Base"],
        "followups": [
            "What is Lunar Space AI?",
            "Tell me about lunar ice.",
            "How does AI help in lunar exploration?",
            "What are the major Moon missions?"
        ]
    }

@router.post("", response_model=StandardResponse)
def query_chat(req: ChatRequest):
    """Processes user query and returns structured conversational response."""
    start_time = time.perf_counter()
    
    match = find_best_response(req.message)
    latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
    
    data = ChatResponseData(
        reply=match["reply"],
        sources=match.get("sources", ["Lunar Space AI Intelligence"]),
        suggested_followups=match.get("followups", []),
        latency_ms=latency_ms
    )
    
    return StandardResponse(
        success=True,
        message="Response generated",
        data=data.model_dump()
    )
