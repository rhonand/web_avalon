Avalon Online (Real-Time Multiplayer Social Deduction Game)

A web-based implementation of The Resistance: Avalon, featuring real-time multiplayer gameplay, modular game engine design, and client-server architecture.

Overview

This project recreates the social deduction game The Resistance: Avalon as an online multiplayer experience.

It supports:

Real-time multi-player interaction
Game state synchronization across clients
Bot automation for offline / hybrid play
Clean separation between game logic and UI

Key Features
Real-Time Multiplayer
Built with WebSocket-based communication
Supports multiple players in a shared room
Synchronizes game state across all clients

Game Engine (Core Design Highlight)
A fully decoupled game engine handles:
Game phases
Role assignment
Voting logic
Quest resolution

The UI is only a projection of engine state — not the source of truth.

Bot System
Automated players with decision logic
Used for:
Testing
Filling empty seats
Simulating gameplay

Hidden Information Control
Each player sees a partial view of the game state
Sensitive information (roles, votes) is filtered

Phase-Based State Machine

Game progression is modeled explicitly:

lobby → initializing → discussion → teamBuilding → vote → quest → result → gameOver

Architecture
                ┌────────────────────┐
                │     Frontend       │
                │ React + TypeScript │
                └─────────┬──────────┘
                          │
                  WebSocket (socket.io)
                          │
                ┌─────────▼──────────┐
                │      Server        │
                │ Node.js            │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │   Game Engine      │
                │ (Core Logic)       │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │ Shared Type System │
                │ (Client + Server)  │
                └────────────────────┘

Core Design Principles
1. Engine–UI Separation
Game logic lives entirely in the engine
UI renders state but does not control logic

Benefits:
Easier testing
Reusability
No UI-driven bugs

2. State Projection (Critical Insight)
Server maintains full state, but sends:
filtered projections per player

Example:
Player A sees roles of evil players
Player B does not

3. Event-Driven System
Game evolves through events:
START_GAME
SELECT_TEAM
VOTE
QUEST_RESULT
Each event triggers deterministic state transitions.

4. Shared Type Definitions
Client and server share:
type Room
type Player
type VoteChoice
type QuestResult
type Phase

Prevents:
Type mismatch
API inconsistency

Gameplay Flow
1. Lobby
Players join room
Host controls game start
2. Initialization
Roles assigned
Temporary hidden state
3. Discussion & Team Building
Leader proposes team
Players discuss
4. Voting
All players vote
Majority decides
5. Quest Execution
Selected players act
Success / fail determined
6. Result & Progression
Game updates
Next leader assigned

UI Structure

Key components:
GameRoomPage
SeatColumn
BoardCenterPanel
VoteModal
QuestModal
UI Behavior Highlights
Phase-driven rendering
Timed transitions (e.g., initialization delay)
Gradual reveal animations

Usage
Start Server
cd server
npm install
npm run dev
Start Client
cd client
npm install
npm run dev
Open in Browser
http://localhost:3000

Design Challenges & Solutions
Challenge 1: Hidden Information
Problem:
Different players see different data
Solution:
Server-side projection layer

Challenge 2: State Synchronization
Problem:
Multiple clients must stay consistent
Solution:
Single source of truth (server engine)

Challenge 3: UI–Logic Coupling
Problem:
UI-driven logic leads to bugs
Solution:
Strict engine–UI separation

Challenge 4: Phase Complexity
Problem:
Game has many conditional transitions
Solution:
Explicit state machine

Future Work
Persistent rooms (database)
Authentication system
Mobile-friendly UI
Voice chat integration
Smarter AI bots
 
Limitations
No persistent storage (in-memory only)
Limited reconnection handling
Basic bot strategy
Why This Project Matters

This project demonstrates:
Real-time distributed system design
State synchronization across clients
Event-driven architecture
Clean separation of concerns

It’s not just a game — it’s:
A mini distributed system with partial observability

Author Notes

Key architectural insight:
Treat the frontend as a stateless projection layer,
and the backend as the single authoritative engine

This approach scales naturally to:

Multiplayer systems
Collaborative tools
Real-time applications

Highlight
If you only remember one thing:
This project solves “multi-agent partial information consistency” in a real-time system.