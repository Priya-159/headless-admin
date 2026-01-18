# 🧪 Complete Testing Guide

## 🚀 **Quick Start (5 Minutes)**

### **Step 1: Start Both Servers**

```bash
# Terminal 1 - Django Backend
cd /path/to/fuelabc
python manage.py runserver

# Terminal 2 - React Frontend
cd /path/to/react-app
npm run dev
```

**Expected Output:**
- Django: `Starting development server at http://127.0.0.1:8000/`
- React: `Local: http://localhost:5173/`

---

### **Step 2: Login**

1. Open browser: `http://localhost:5173`
2. You should see the login page
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click "Sign In"

**Expected:** Redirect to `/accounts` dashboard

---

### **Step 3: Quick Visual Test**

Click through these sections and verify no errors:

```
✅ Accounts (should show stats dashboard)
✅ Accounts → All Users (should show table)
✅ Accounts → Countries (should show countries)
✅ Contact Messages (should show overview)
✅ Notifications (should show overview)
✅ Vehicle (should show vehicle stats)
✅ FCM Devices (should show devices page)
```

**If you see loading spinners → Good! API calls working**
**If you see data tables → Excellent! Django endpoints working**
**If you see empty states → OK, just no data yet**
**If you see error toasts → Check Django logs**

---

## 🔍 **Detailed Testing**

### **Test 1: Authentication Flow**

1. **Login Test:**
   ```
   ✅ Visit http://localhost:5173
   ✅ See login form
   ✅ Enter admin/admin123
   ✅ Click Sign In
   ✅ Redirected to /accounts
   ✅ See username in navbar (top-right)
   ```

2. **Protected Routes Test:**
   ```
   ✅ Logout
   ✅ Try to visit http://localhost:5173/accounts
   ✅ Should redirect to /login
   ```

3. **Logout Test:**
   ```
   ✅ Login again
   ✅ Click user icon (top-right)
   ✅ Click Logout
   ✅ Redirected to /login
   ```

---

### **Test 2: AccountsDashboard (10 sections)**

**Dashboard Overview:** `/accounts`
```
✅ Shows 4 stat cards (Total Users, Active Users, New Users, Total Vehicles)
✅ Shows user growth chart
✅ Check browser DevTools → Network tab
✅ Should see: GET /api/dashboard/stats/
✅ Should see: GET /api/dashboard/charts/users-growth/
```

**All Users:** `/accounts/all-users`
```
✅ Shows user list table
✅ Search box works
✅ Type in search → filters users
✅ Check Network: GET /api/dashboard/users/
```

**Blocked Users:** `/accounts/blocked-users`
```
✅ Shows blocked users table
✅ Check Network: GET /api/dashboard/users/blocked/
```

**Countries:** `/accounts/countries`
```
✅ Shows countries table
✅ Check Network: GET /api/country_list
```

**States:** `/accounts/states`
```
✅ Shows states table
✅ Check Network: GET /api/state_list
```

**Subscription:** `/accounts/subscription`
```
✅ Shows subscription transactions
✅ Check Network: GET /api/transaction_history
```

**Trip Usages:** `/accounts/trip-usages`
```
✅ Shows trip usages
✅ Check Network: GET /api/trip_history
```

**Emergency:** `/accounts/emergency`
```
✅ Shows emergency numbers
✅ Check Network: GET /api/emergency_numbers
```

**Free Request:** `/accounts/free-request`
```
✅ Shows free request logs
✅ Check Network: GET /api/request-status
```

---

### **Test 3: VehiclePage (11 sections)**

**Overview:** `/vehicles`
```
✅ Shows 4 stat cards
✅ Check Network: GET /api/vehicle_config
```

**Logbooks:** `/vehicles/logbooks`
```
✅ Shows logbook entries
✅ Search works
✅ Check Network: GET /api/view_log
```

**Notifications:** `/vehicles/notifications`
```
✅ Shows vehicle notifications
✅ Check Network: GET /api/notification_list
```

**Reminders:** `/vehicles/reminders`
```
✅ Shows reminders table
✅ Check Network: GET /api/reminder
```

**Tip of Day:** `/vehicles/tip-of-day`
```
✅ Shows tips in card format
✅ Check Network: GET /api/tip_of_day
```

**Trips:** `/vehicles/trips`
```
✅ Shows trip history
✅ Check Network: GET /api/trip_history
```

**Settings:** `/vehicles/settings`
```
✅ Shows user settings
✅ Check Network: GET /api/user_setting
```

**Fuel Analytics:** `/vehicles/fuel-analytics`
```
✅ Shows analytics dashboard
✅ Shows chart (if data available)
✅ Check Network: GET /api/vehicle_cost_analytics
```

**Insurance:** `/vehicles/insurance`
```
✅ Shows insurance records
✅ Check Network: GET /api/insurance-callback-data
```

**Service Records:** `/vehicles/service-records`
```
✅ Shows placeholder message
⏳ Coming soon
```

**PUC:** `/vehicles/puc`
```
✅ Shows placeholder message
⏳ Coming soon
```

**Documents:** `/vehicles/documents`
```
✅ Shows placeholder message
⏳ Coming soon
```

---

### **Test 4: NotificationPage (6 sections)**

**Overview:** `/notifications`
```
✅ Shows 4 stat cards
✅ Shows recent notifications
✅ Check Network: GET /api/notifications/active
```

**All Notifications:** `/notifications/all`
```
✅ Shows notification list
✅ Search works
✅ Check Network: GET /api/notification_list
```

**Scheduled:** `/notifications/scheduled`
```
✅ Shows scheduled notifications
✅ Check Network: GET /api/notifications
```

**Date Range:** `/notifications/date-range`
```
✅ Shows date range campaigns
✅ Check Network: GET /api/notifications/scheduled/campaigns
```

**CSV Campaign:** `/notifications/csv-campaign`
```
✅ Shows CSV campaigns
✅ Check Network: GET /api/notifications/campaigns
```

**Push:** `/notifications/push`
```
✅ Shows placeholder
⏳ Coming soon
```

**Email:** `/notifications/email`
```
✅ Shows placeholder
⏳ Coming soon
```

---

### **Test 5: ContactMessagesPage (3 sections)**

**Overview:** `/contact`
```
✅ Shows 4 stat cards
✅ Shows recent messages
✅ Check Network: GET /api/message_list
```

**All Messages:** `/contact/all-messages`
```
✅ Shows all messages
✅ Search works
✅ Check Network: GET /api/message_list
```

**Inquiries:** `/contact/inquiries`
```
✅ Shows filtered inquiries
✅ Check Network: GET /api/message_list
✅ Client-side filtering applied
```

**Feedback:** `/contact/feedback`
```
✅ Shows filtered feedback
✅ Check Network: GET /api/message_list
✅ Client-side filtering applied
```

---

### **Test 6: FCMDevicesPage (1 section)**

**Devices:** `/fcm-devices`
```
✅ Shows device stats (if data exists)
✅ Shows device table
✅ Shows empty state (if no data)
✅ Search works
⚠️ May need GET endpoint in Django
```

---

## 🐛 **Troubleshooting**

### **Issue 1: Can't Login**

**Symptom:** Login button does nothing or shows error

**Check:**
```bash
# Terminal 1 - Check Django logs
# Should see: POST /api/auth/login/

# If 401 Unauthorized:
python manage.py createsuperuser
# Use those credentials instead
```

---

### **Issue 2: CORS Error**

**Symptom:** Browser console shows:
```
Access to fetch at 'http://localhost:8000/api/...' 
has been blocked by CORS policy
```

**Fix:** Check Django `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

---

### **Issue 3: All API Calls Return 401**

**Symptom:** After login, every page shows error

**Check:**
1. Open DevTools → Application → Local Storage
2. Should see `access_token` and `refresh_token`
3. If missing, check `AuthContext.tsx`

**Fix:**
```bash
# Clear browser storage
# Logout and login again
```

---

### **Issue 4: Loading Spinner Forever**

**Symptom:** Page shows spinner but never loads data

**Check:**
1. DevTools → Network tab
2. Look for failed API calls (red)
3. Click on failed request
4. Check response

**Common Causes:**
- Django endpoint doesn't exist
- Wrong API URL in `.env`
- Django server not running
- Authentication token expired

---

### **Issue 5: Empty Tables**

**Symptom:** Tables load but show "No data"

**This is OK!** It means:
- ✅ API call succeeded
- ✅ Component working correctly
- ℹ️ Just no data in database yet

**To Add Data:**
```bash
# Use Django admin
python manage.py createsuperuser
# Visit http://localhost:8000/admin
# Add test data
```

---

### **Issue 6: Page Not Found**

**Symptom:** Clicking sidebar item shows 404

**Check:**
1. URL in browser address bar
2. Should match routes in `App.tsx`

**If route doesn't work:**
- Clear browser cache
- Restart React dev server
- Check `App.tsx` routes

---

## 📊 **Network Tab Debugging**

Open DevTools → Network tab to see all API calls:

### **Successful Call:**
```
Status: 200 OK
Response: { data: [...] }
```

### **Authentication Error:**
```
Status: 401 Unauthorized
Fix: Re-login or check token
```

### **Not Found:**
```
Status: 404 Not Found
Fix: Add Django endpoint
```

### **Server Error:**
```
Status: 500 Internal Server Error
Fix: Check Django logs
```

---

## ✅ **Complete Checklist**

### **Backend (Django):**
- [ ] Server running on port 8000
- [ ] Can visit http://localhost:8000/admin
- [ ] Superuser created
- [ ] CORS configured
- [ ] JWT authentication working
- [ ] At least these endpoints exist:
  - [ ] POST /api/auth/login/
  - [ ] GET /api/auth/me/
  - [ ] GET /api/dashboard/stats/
  - [ ] GET /api/dashboard/users/

### **Frontend (React):**
- [ ] Server running on port 5173
- [ ] Can visit http://localhost:5173
- [ ] .env file created with VITE_API_URL
- [ ] No console errors on load
- [ ] Login page appears
- [ ] Can login successfully
- [ ] Sidebar navigation works
- [ ] All 31 routes accessible

### **Integration:**
- [ ] Login stores tokens
- [ ] API calls include Authorization header
- [ ] Data loads from Django
- [ ] Loading spinners work
- [ ] Error toasts appear on failures
- [ ] Search/filter works
- [ ] Logout works

---

## 🎯 **Expected Results**

### **✅ Good Signs:**
- Loading spinners appear briefly
- Data tables populate with data
- Search/filter works
- No console errors
- Network tab shows 200 status codes
- Can navigate between pages
- Can logout successfully

### **⚠️ Warning Signs (But OK):**
- Empty tables (just no data yet)
- Some endpoints return 404 (need to add)
- Placeholder sections (coming soon)

### **❌ Bad Signs:**
- Login doesn't work
- All pages show errors
- CORS errors in console
- Can't access any route
- Tokens not saved
- 500 errors from Django

---

## 📞 **Report Results**

After testing, send me:

```
✅ Login: [Working/Not Working]
✅ Dashboard loads: [Yes/No]
✅ API calls visible in Network tab: [Yes/No]
✅ Data shows in tables: [Yes/No/Empty]
✅ Console errors: [None/List them]
✅ Django endpoints working: [List which ones]
✅ Routes tested: [X out of 31]

Any issues: [Describe here]
```

Then I can help fix any remaining issues! 🚀
