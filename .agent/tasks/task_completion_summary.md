# Task Completion: Update FCM Devices and Vehicle Trips Columns

## Changes Implemented

### 1. FCM Devices Page (`src/app/components/FCMDevicesPage.tsx`)
- **Renamed Column**: Changed the "Phone Number" column header to "User".
- **Enhanced Data Display**: Updated `UserCell` component to prioritize displaying the `username` first, falling back to `phone`, `phone_no`, or `email`. This ensures the user identity is clearer.

### 2. Vehicle Trips Page (`src/app/components/VehiclePage.tsx`)
- **Enhanced Trip Info**: Updated the `TripVehicleInfoCell` component (used in the "Vehicle" column of the Trips table).
- **Data Fetching**: Modified the fetch logic to prioritize retrieving the user's `username`.
- **Display Format**: Changed the display format to `username - vehicle_model` (e.g., "john_doe - Apache 160"), as requested. Previously it prioritized the phone number.

## Verification
- **FCM Devices**: The table now shows a "User" column populated with usernames where available.
- **Vehicle Trips**: The "Vehicle" column in the Trips table now displays the combined "Username - Vehicle Model" information.
- **No Backend Changes**: All modifications were strictly frontend-side (React), utilizing existing API endpoints (`api.accounts.users.get`).
