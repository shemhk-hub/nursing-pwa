# 📊 MONITORING SETUP GUIDE

**Status:** Production Monitoring Configuration  
**Date:** 2026-06-06  
**App:** Nursing PWA (https://nursing-pwa.vercel.app)

---

## 🎯 MONITORING STRATEGY

### **What We'll Monitor**
1. **Application Errors** - Via Sentry
2. **Performance Metrics** - Via Vercel Analytics
3. **Database Health** - Via Supabase
4. **Uptime & Availability** - Via UptimeRobot
5. **Real User Metrics** - Via Vercel Web Analytics

---

## 1️⃣ **SENTRY - ERROR TRACKING**

### **Why Sentry?**
- Real-time error notifications
- Source map support
- Performance monitoring
- Release tracking
- Team alerts

### **Setup Steps**

#### **Step 1: Create Sentry Account**
1. Visit https://sentry.io
2. Click "Get Started"
3. Sign up (use your email)
4. Create organization: `nursing-pwa`

#### **Step 2: Create Project**
1. Select "Next.js" as platform
2. Project name: `nursing-pwa-production`
3. Copy your **Sentry DSN** (looks like: `https://xxx@yyy.ingest.sentry.io/zzz`)

#### **Step 3: Install Sentry in Your App**
```bash
npm install @sentry/nextjs
```

#### **Step 4: Update next.config.js**
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  {
    // Your next.js config
  },
  {
    org: "your-org",
    project: "nursing-pwa-production",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

#### **Step 5: Create sentry.client.config.ts**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

#### **Step 6: Add Environment Variables to Vercel**
In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

#### **Step 7: Deploy & Test**
```bash
# Push to GitHub
git add .
git commit -m "Add Sentry monitoring"
git push origin main

# Vercel will auto-deploy
# Check Sentry dashboard after deployment
```

### **Sentry Alerts Setup**
1. Go to Sentry Project Settings
2. Click "Alerts"
3. Create new alert:
   - Condition: "Error rate above 1%"
   - Action: "Send email notification"
4. Add team members

### **What Sentry Tracks**
- ✅ Unhandled errors
- ✅ API failures
- ✅ Database errors
- ✅ Performance issues
- ✅ User sessions
- ✅ Page load times

---

## 2️⃣ **VERCEL ANALYTICS - PERFORMANCE**

### **Already Built-In! ✅**

#### **Access Vercel Analytics**
1. Go to: https://vercel.com/shem-s-projects1/nursing-pwa
2. Click "Analytics" in sidebar
3. View:
   - Page load times
   - Core Web Vitals
   - Traffic patterns
   - Error rates

#### **Key Metrics to Monitor**
| Metric | Target | Warning |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | > 2.5s |
| Largest Contentful Paint | < 2.5s | > 4s |
| Cumulative Layout Shift | < 0.1 | > 0.25 |
| Time to Interactive | < 3.5s | > 5s |

#### **Setup Alerts in Vercel**
1. Project Settings → Monitoring
2. Enable "Performance Alerts"
3. Set thresholds
4. Add email for notifications

---

## 3️⃣ **SUPABASE - DATABASE MONITORING**

### **Access Supabase Dashboard**
https://supabase.com/dashboard/project/uiakghpvtayplyuaxzyh

### **Monitor These**

#### **1. Database Health**
1. Click "Database" → "Health"
2. Monitor:
   - CPU usage
   - Memory usage
   - Disk space
   - Connections

#### **2. Query Performance**
1. Click "Database" → "Logs"
2. Filter by slow queries
3. Optimize if needed

#### **3. Backup Status**
1. Click "Database" → "Backups"
2. Verify daily backups running
3. Test restore procedure

#### **4. Network Activity**
1. Click "Database" → "Statistics"
2. Monitor active connections
3. Check bandwidth usage

### **Supabase Alerts**
Currently manual - check dashboard weekly for:
- High CPU usage
- Large query times
- Connection pool exhaustion
- Storage limits

---

## 4️⃣ **UPTIMEROBOT - UPTIME MONITORING**

### **Why UptimeRobot?**
- 24/7 uptime monitoring
- 5-minute check interval (free plan)
- Instant alerts
- Status page
- Historical data

### **Setup Steps**

#### **Step 1: Create UptimeRobot Account**
1. Visit https://uptimerobot.com
2. Sign up for free
3. Verify email

#### **Step 2: Create Monitor**
1. Click "Add New Monitor"
2. Set these values:
   - **Monitor Type:** HTTPS
   - **Friendly Name:** Nursing PWA Production
   - **URL:** https://nursing-pwa.vercel.app
   - **Monitoring Interval:** 5 minutes
   - **Alert Contacts:** Your email

#### **Step 3: Add Health Check Endpoint**
1. Create endpoint: `/api/health` (optional)
2. Set UptimeRobot to check this
3. More accurate than homepage checks

#### **Step 4: Setup Alerts**
1. Go to "Alert Contacts"
2. Add email
3. Check "Get alerts for this monitor"

#### **Step 5: Create Status Page** (Optional)
1. Settings → Status Page
2. Enable public status page
3. Share with users: `https://status.nursing-pwa.com`

### **What UptimeRobot Tracks**
- ✅ Server availability
- ✅ Response times
- ✅ HTTP status codes
- ✅ SSL certificate expiry
- ✅ Downtime incidents

---

## 5️⃣ **GOOGLE ANALYTICS - USER BEHAVIOR**

### **Setup Steps**

#### **Step 1: Create Google Analytics Account**
1. Visit https://analytics.google.com
2. Create new property
3. Website name: `Nursing PWA`
4. Website URL: https://nursing-pwa.vercel.app
5. Copy **Measurement ID** (G-XXXXXXX)

#### **Step 2: Install Google Analytics**
```bash
npm install @react-google-analytics/js
```

#### **Step 3: Create lib/google-analytics.ts**
```typescript
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
};

export const event = (action: string, params: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};
```

#### **Step 4: Add to RootLayout**
```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### **Step 5: Add Environment Variable**
In Vercel dashboard:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXX
```

### **What Google Analytics Tracks**
- ✅ User sessions
- ✅ Page views
- ✅ User demographics
- ✅ Traffic sources
- ✅ User behavior flow
- ✅ Conversion events

---

## 📊 MONITORING DASHBOARD SETUP

### **Create a Monitoring Dashboard**

1. **Weekly Check (Every Monday)**
   - [ ] Sentry: Check errors from last week
   - [ ] Vercel: Review performance metrics
   - [ ] Supabase: Check database health
   - [ ] UptimeRobot: Verify 100% uptime

2. **Monthly Review (First of month)**
   - [ ] Analyze Google Analytics
   - [ ] Review user feedback
   - [ ] Identify performance issues
   - [ ] Plan optimizations

3. **Quarterly Analysis**
   - [ ] Review overall metrics
   - [ ] Plan feature releases
   - [ ] Evaluate infrastructure needs
   - [ ] Update monitoring thresholds

---

## 🚨 ALERT CONFIGURATION

### **Critical Alerts**
| Alert | Threshold | Action |
|-------|-----------|--------|
| Error Rate High | > 5% | Immediately page on-call |
| App Downtime | Any | Instant notification |
| Database Down | Any | Email + Slack |
| High CPU Usage | > 80% | Scale resources |
| Slow Page Load | > 5s | Investigate |

### **Non-Critical Alerts**
- Performance degradation
- Unusual traffic patterns
- High bandwidth usage
- Backup failures

---

## 📱 MOBILE ALERTS

### **Setup Slack Alerts** (Optional)
1. Create Slack workspace
2. Create #alerts channel
3. Connect monitoring tools:
   - Sentry → Slack
   - UptimeRobot → Slack
   - Vercel → Slack
4. Get real-time notifications

### **SMS Alerts** (Optional)
For critical issues:
1. UptimeRobot → SMS option
2. Sentry → SMS on critical errors
3. Twilio integration for custom alerts

---

## 📈 MONITORING CHECKLIST

### **Before Going Live**
- [x] Vercel deployed
- [ ] Sentry configured
- [ ] UptimeRobot monitoring
- [ ] Google Analytics enabled
- [ ] Supabase backups verified
- [ ] Alert contacts configured
- [ ] Team members notified

### **First Week**
- [ ] Review error patterns
- [ ] Identify slow pages
- [ ] Monitor user behavior
- [ ] Check database performance
- [ ] Verify backups working

### **First Month**
- [ ] Analyze all metrics
- [ ] Optimize based on data
- [ ] Add more alerts if needed
- [ ] Document findings
- [ ] Plan improvements

---

## 🔗 QUICK LINKS

| Service | URL | Purpose |
|---------|-----|---------|
| **Sentry** | https://sentry.io | Error tracking |
| **Vercel Analytics** | https://vercel.com/shem-s-projects1/nursing-pwa/analytics | Performance |
| **Supabase Dashboard** | https://supabase.com/dashboard | Database |
| **UptimeRobot** | https://uptimerobot.com | Uptime |
| **Google Analytics** | https://analytics.google.com | User behavior |
| **App** | https://nursing-pwa.vercel.app | Live app |

---

## 💡 MONITORING BEST PRACTICES

1. **Set Realistic Targets**
   - Don't aim for perfection
   - Set thresholds above normal variation

2. **Act on Alerts**
   - Don't ignore notifications
   - Investigate and fix issues quickly

3. **Regular Reviews**
   - Weekly: Check errors
   - Monthly: Analyze trends
   - Quarterly: Strategic planning

4. **Keep Team Updated**
   - Share metrics weekly
   - Celebrate improvements
   - Address issues transparently

5. **Continuous Improvement**
   - Use data to improve
   - Test optimizations
   - Measure impact

---

## 📞 SUPPORT

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Vercel Docs:** https://vercel.com/docs/analytics
- **Supabase Docs:** https://supabase.com/docs
- **UptimeRobot Help:** https://uptimerobot.com/help/

---

Generated: 2026-06-06  
Next Review: 2026-06-13 (weekly check)  
Type: Production Monitoring Configuration

**Start with Sentry + UptimeRobot for best coverage!** 🚀
