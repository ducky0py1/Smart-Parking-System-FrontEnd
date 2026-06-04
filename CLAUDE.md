### File 1: `FRONTEND_INTEGRATION_GUIDE.md`
**Purpose:** Instructions on what to preserve and how to connect the new UI to the existing logic.

```markdown
# 🛠️ Frontend Integration & Logic Protection Guide

## 1. Protected Files (DO NOT MODIFY LOGIC)
To ensure the system continues to communicate with Laravel and the Blockchain, the following files must be used as "Data Providers" only. Do not alter their internal logic:
- `src/context/AuthContext.jsx`: Handles MetaMask login, Sanctum tokens, and User State.
- `src/context/ParkingContext.jsx`: Handles real-time polling of spots from Laravel.
- `src/services/api.js`: Handles Axios headers and Bearer tokens.
- `src/services/blockchainService.js`: Handles the actual ethers.js calls to Ganache.
- `src/services/socketService.js`: Manages the polling intervals.

## 2. Global State Usage
- Use `const { user, token, connectWallet, updateProfile } = useAuth();` to manage identity.
- Use `const { spots, selectedSpot, selectSpot, refreshSpots } = useParking();` to manage parking data.

## 3. Communication Protocol
- **UI -> Logic:** UI components should call functions from Contexts (e.g., `connectWallet()`).
- **Logic -> UI:** UI components should "subscribe" to states (e.g., `user.role` or `spots`).
- **Payment Flow:** 
    1. UI calculates `Total = Spot.price + user.debt`.
    2. UI calls `blockchainService.payForSpot(id, Total)`.
    3. **Only after** the promise resolves, UI calls `api.post('/reservations', ...)` to notify Laravel.
```

---

### File 2: `UI_UX_DESIGN_SYSTEM.md`
**Purpose:** Defining the visual stack, animations, and the bridge for 3D visualization.

```markdown
#  UI/UX Design System & 3D Integration

To achieve a "Next-Gen Web3" feel, the frontend should prioritize dark-mode aesthetics, smooth state transitions, and a low-latency 3D interactive area.
Very important note: use react.js icons instead of emojis, if needed!.

## 1. Recommended UI Stack
-**Theme:** integrate light and dark theme, user could switch the theme via a circle in the nav bar (sun & half-moon)
- **Styling:** Tailwind CSS (Utility-first).
- **Components:** [Shadcn/UI](https://ui.shadcn.com/) (Built on Radix UI). It provides accessible, clean components (Modals, Tables, Cards).
- **Animations:** [Framer Motion](https://www.framer.com/motion/). Use this for:
    - Page transitions.
    - Smooth "Pop-up" effects for the Profile Completion modal.
    - Hover effects on parking spots.
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/). Vital for blockchain transaction feedback (Pending/Success/Error).

## 2. 3D Visualization Strategy (Three.js)
The parking map will be rendered inside a `<canvas>` using `@react-three/fiber`.
- **Logic Mapping:**
    - Each `spot` from `ParkingContext` is mapped to a 3D `<Box />` or `<Mesh />`.
    - **Positioning:** Assign X, Z coordinates based on the spot index (e.g., Row 1: X= -5 to 5, Z= 0).
- **Interactive Props:**
    - `color`: Based on `spot.status` (Green/Orange/Red).
    - `onClick`: Triggers `selectSpot(spot.id)` and opens the Payment Modal.
- **Assets:** Use a low-poly Car model (GLB format) that renders only when `status === 'occupied'`.

## 3. The "Modern" Component Checklist
### A. The Payment Modal (Driver)
- **Glassmorphism:** Use a semi-transparent background with `backdrop-blur-md`.
- **Dynamic Calculation:** Clearly show the breakdown:
    - `Base Price: 0.001 ETH`
    - `Unpaid Debt: +0.005 ETH`
    - `-------------------------`
    - `Total: 0.006 ETH`
- **Execution:** A "Confirm" button that transforms into a "Transaction Pending..." spinner.

### B. Profile Completion Popup
- **Requirement:** This should be a centered overlay that cannot be closed until the profile is valid.
- **Fields:** Input fields for `first_name`, `last_name`, and `email` with real-time validation.

### C. Admin KPIs (Cards)
- Use a "Glass-card" design with neon accents:
    - **Green Neon:** For revenue/earnings.
    - **light Cyan Neon:** For active occupancy.
    - **light Pink:** For system alerts or sensors offline.
    - **Hot Orange:** Reference for metamask

## 4. Visual States & Feedback
- **Loading:** Use "Skeleton Screens" while `isLoading` from `ParkingContext` is true.
- **Transaction Flow:** 
    -  **Step 1:** "Signing Transaction..." (MetaMask open).
    -  **Step 2:** "Confirming on Blockchain..." (Waiting for receipt).
    -  **Step 3:** "Reservation Verified!" (Laravel updated).
```

---

###  Summary of the Full Package

With these 4 files, the AI model can rebuild your frontend with the following results:

1.  **Safety:** Your Laravel and Blockchain connections remain intact.
2.  **Role-Based Access:** Admin and Drivers see completely different, tailored interfaces.
3.  **Modern UX:** A profile completion requirement ensures data integrity, while Three.js provides a high-end visual experience.
4.  **Complex Logic:** The "Debt + Price" calculation is handled gracefully before reaching the blockchain.

###  Final Tips for your Three.js implementation:
When you start building the 3D part, **don't build the 3D scene inside the Dashboard.** 
1. Create a component called `ParkingMap3D.jsx`.
2. Import `useParking` inside it.
3. Use the `Canvas` from `@react-three/fiber` to wrap your 3D elements.
4. Pass the `spots` array to a `map` function inside the `Canvas`.

### Final Tip for the Design:
When you build the **Login Page**, make the "Connect Wallet" button the star of the show. Since you are using **Three.js**, you could even put a cool 3D animation of a floating car or a glowing parking spot behind the login card to set the mood immediately.Same for the home page, make the user feel amazed by the application through the unique design, scroll effect. leave the place of images empty and tell me where I could add insert them later by myself, dont forget the inhance the most important functionalities that the application offers.

### File 3: `DRIVER_DASHBOARD_REQUIREMENTS.md`
**Purpose:** Specific features and flows for the Driver user.
**Flow:** Signup & connnect metamask -> welcom  
```markdown
#  Driver Dashboard: Functional Requirements

## 1. Entry Flow & Profile Completion
- **Conditional Trigger:** Upon successful MetaMask login, the system must check if `user.first_name` or `user.email` is null.
- **Requirement:** If null, a **non-dismissible Modal** must appear prompting the user to complete their profile (First Name, Last Name, Email).
- **Action:** This modal calls `updateProfile(formData)` from the `AuthContext`.

## 2. Parking Visualization (Interactive Map)
- **Requirement:** Building a 3d model using three.js where the user could zoom out and in, select place, with splited display Menu of payment details 
- **Dynamic Styling:** 
    - `free`: Green/Available (Clickable).
    - `reserved`: Orange (Non-clickable).
    - `occupied`: Red (Non-clickable).
- **Real-time:** The map must update every 3 seconds (handled by `ParkingContext`).

## 3. Reservation & Payment Process
- **Step 1:** On clicking a `free` spot, show a confirmation summary.
- **Step 2 (Debt Check):** The UI must display the user's current debt (`user.debt`). 
- **Step 3 (Calculation):** The total payment requested must be `spot.price + user.debt`.
- **Step 4 (Blockchain):** Execute `payForSpot` via MetaMask.
- **Step 5 (Sync):** Send the `transaction_hash` to Laravel `/api/reservations`.

## 4. User History
- **Requirement:** A dedicated section/page to list the user's specific reservations.
- **Data:** Fetch from `/api/reservations/history`.
- **Columns:** Spot Label, Date, Status (Active/Completed), Transaction Hash (linked to Ganache explorer).
```

---
### File 4: `ADMIN_DASHBOARD_REQUIREMENTS.md`
**Purpose:** Specific features for the Administrator.

```markdown
#  Admin Dashboard: Functional Requirements

## 1. Analytics & Overview (KPI Cards)
- **Revenue:** Display total ETH collected (Sum of completed reservations).
- **Occupancy Rate:** Percentage of spots currently `occupied` or `reserved`.
- **Active Users:** Count of users currently parked.

## 2. Parking Management (CRUD)
- **Create:** Form to add a new `parking_spot` (Label, Price, Sensor_ID).
- **Read:** A tabular view of all spots with their current technical status.
- **Update:** Ability to change the price or label of an existing spot.
- **Delete:** Ability to remove a spot from the system.

## 3. Live Monitoring & Control
- **Manual Override:** Admin must have a "Force Release" button for `occupied` or `reserved` spots. 
    - *Action:* Calls a backend endpoint to set spot status to `free`.
- **Real-time Feed:** A list of recent activities (e.g., "User 0x... parked in Spot A1").

## 4. User & Debt Management
- **Requirement:** A searchable list of all registered wallet addresses.
- **View:** Ability to see which users have outstanding `debt` and their reservation history.
```

---

### Next Steps & Tips for Rebuilding:

1.  **Layout Separation:** In your `App.jsx`, use a conditional check on `user.role` to render either the `<AdminLayout />` or `<DriverLayout />`.
2.  **Three.js Integration:** When building the 3D map, keep the 3D scene inside a single component (e.g., `ParkingMap3D.jsx`). Pass the `spots` array from `ParkingContext` into this component as a prop.
3.  **Debt Visibility:** Always make the debt visible to the driver in the UI (e.g., a "Balance Due" badge in the Navbar) so they aren't surprised by the price during checkout.

**Would you like me to continue with a fourth file regarding the UI Component library (like Shadcn/UI or Framer Motion) to help with the "Modern" look you want?**
