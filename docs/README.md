# 📚 AKC Revisions Documentation

## 🎯 **START HERE**

Welcome to the AKC Revisions construction management application documentation. This guide will help you understand the system architecture, recent changes, and how to contribute effectively.

### **🚀 For New Developers/AI Agents**

1. **Read First**: [`../CODEBASE_ORGANIZATION.md`](../CODEBASE_ORGANIZATION.md) - Complete architecture overview
2. **Recent Changes**: [`../UX_IMPROVEMENTS_SUMMARY.md`](../UX_IMPROVEMENTS_SUMMARY.md) - Latest UX enhancements
3. **API Fixes**: [`../API_URL_FIX_SUMMARY.md`](../API_URL_FIX_SUMMARY.md) - Critical proxy configuration

---

## 📂 **DOCUMENTATION STRUCTURE**

### **🏗️ Core Architecture**

- [`../CODEBASE_ORGANIZATION.md`](../CODEBASE_ORGANIZATION.md) - **Main architecture document**
- [`development_setup.md`](development_setup.md) - Development environment setup
- [`auth_flow.md`](auth_flow.md) - Authentication and OAuth flow

### **📅 Calendar Integration**

- [`calendar/`](calendar/) - Calendar integration documentation
- [`../CALENDAR_INTEGRATION_FINAL_PLAN.md`](../CALENDAR_INTEGRATION_FINAL_PLAN.md) - Final implementation plan
- [`../calendar-integration-demo.js`](../calendar-integration-demo.js) - Working demo script

### **🎨 UX & Scheduling**

- [`../UX_IMPROVEMENTS_SUMMARY.md`](../UX_IMPROVEMENTS_SUMMARY.md) - **Recent UX improvements**
- [`scheduling/`](scheduling/) - Scheduling system documentation
- [`design_system/`](design_system/) - UI/UX design guidelines

### **🗄️ Database**

- [`db/`](db/) - Database documentation and schemas
- [`supabase_guide_for_agents.md`](supabase_guide_for_agents.md) - Supabase integration guide
- [`../schema-summary.md`](../schema-summary.md) - Database schema overview

### **🔧 API & Integrations**

- [`api/`](api/) - API documentation
- [`integrations/`](integrations/) - Third-party integrations
- [`../API_URL_FIX_SUMMARY.md`](../API_URL_FIX_SUMMARY.md) - **Critical API routing fixes**

### **📋 Implementation History**

- [`../FINAL_IMPLEMENTATION_SUMMARY.md`](../FINAL_IMPLEMENTATION_SUMMARY.md) - Complete implementation summary
- [`../IMPLEMENTATION_COMPLETE.md`](../IMPLEMENTATION_COMPLETE.md) - Implementation completion status
- [`project-history/`](project-history/) - Historical project documentation

---

## 🚀 **QUICK START GUIDE**

### **1. Understanding the System**

```bash
# Read the main architecture document
cat ../CODEBASE_ORGANIZATION.md

# Check recent changes
cat ../UX_IMPROVEMENTS_SUMMARY.md
```

### **2. Setting Up Development**

```bash
# Backend server (Terminal 1)
cd server && node server.js

# Frontend server (Terminal 2)
npm run dev
```

### **3. Testing the System**

```bash
# Health checks
curl http://localhost:3000/        # Backend
curl http://localhost:8080/        # Frontend
curl http://localhost:8080/api/auth/status  # API proxy
```

---

## 🎯 **KEY CONCEPTS**

### **Intelligent Scheduling System**

The application features a sophisticated scheduling system with:

- **Context-aware calendar selection** - Automatically chooses appropriate calendars
- **Smart dropdowns** - Shows only relevant projects/work orders based on context
- **Google Calendar integration** - Full OAuth flow with session management
- **Unified interface** - Single dialog for all scheduling needs

### **Architecture Principles**

- **Separation of concerns** - Services handle business logic, components handle UI
- **Context awareness** - System understands project vs work order vs personal contexts
- **Progressive disclosure** - Show complexity only when needed
- **API proxy pattern** - Frontend uses Vite proxy to communicate with backend

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

#### **401 Unauthorized Errors**

- **Solution**: Check [`../API_URL_FIX_SUMMARY.md`](../API_URL_FIX_SUMMARY.md)
- **Root Cause**: API calls not using Vite proxy correctly
- **Fix**: Ensure all API calls use relative URLs (e.g., `/api/projects`)

#### **Calendar Integration Issues**

- **Solution**: Check Google OAuth configuration
- **Test**: Run `node ../calendar-integration-demo.js`
- **Verify**: Authentication flow in [`auth_flow.md`](auth_flow.md)

#### **Database Connection Issues**

- **Solution**: Check Supabase configuration
- **Guide**: [`supabase_guide_for_agents.md`](supabase_guide_for_agents.md)
- **Verify**: Environment variables in `.env.local`

---

## 📝 **CONTRIBUTING**

### **Making Changes**

1. **Understand current state** - Read architecture documentation
2. **Follow patterns** - Use existing service and component patterns
3. **Test thoroughly** - Verify both frontend and backend functionality
4. **Document changes** - Update relevant documentation files

### **Documentation Standards**

- **Create summaries** for major changes (see existing `*_SUMMARY.md` files)
- **Update architecture docs** when making structural changes
- **Include examples** and code snippets where helpful
- **Use clear headings** and emoji for visual organization

---

## 🎉 **CURRENT STATUS**

### **✅ What's Working**

- Intelligent scheduling system with context-aware UI
- Google Calendar integration with OAuth
- Proper API routing through Vite proxy
- Uniform user experience across all scheduling contexts

### **🚀 Ready for Extension**

- Additional calendar providers (Outlook, etc.)
- More entity types for scheduling
- Enhanced mobile responsiveness
- Advanced scheduling features

---

## 📞 **QUICK REFERENCE**

### **Critical Files**

- `../CODEBASE_ORGANIZATION.md` - **Main architecture document**
- `../vite.config.ts` - **Proxy configuration (CRITICAL)**
- `../src/services/calendarSelectionService.ts` - Calendar selection logic
- `../server/server.js` - Backend API and authentication

### **Key Commands**

```bash
# Start development
cd server && node server.js  # Terminal 1
npm run dev                  # Terminal 2

# Test calendar integration
node ../calendar-integration-demo.js

# Health checks
curl http://localhost:8080/api/auth/status
```

**🎯 This documentation structure ensures future developers can quickly understand and contribute to the system!**
