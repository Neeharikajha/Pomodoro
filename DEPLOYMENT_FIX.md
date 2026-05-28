# Deployment Issues & Fixes

## Issue 1: Players Disappearing

**Problem:** Remote players appear briefly then disappear.

**Cause:** The deployed version is using old code without the timer updates and proper player tracking.

**Fix:** You need to redeploy with the latest code. Make sure these files are committed:

- `src/net/client.ts` (with timer_updates handler)
- `server.js` (with startTimerBroadcast function)
- `src/game/remotePlayer.ts` (with \_seatStartTime calculation)

**Steps:**

```bash
git add .
git commit -m "Fix player sync and timer updates"
git push
```

Then Render will auto-deploy the new version.

---

## Issue 2: NPCs/Sprites Showing as Boxes

**Problem:** Character sprites not loading, showing colored boxes instead.

**Causes:**

1. Sprite files not being served correctly
2. CORS issues with image loading
3. Paths incorrect in production

**Check:**

1. Are sprite files in `public/` folder?
2. Are they being copied to `dist/` during build?
3. Check browser console for 404 errors on sprite files

**Quick Fix:**
Make sure all sprite SVG files are in the `public/` folder (not `src/assets/`). Vite automatically copies `public/` contents to `dist/` during build.

---

## Verification Steps

After redeploying:

1. **Check Browser Console** (F12):
   - Should see: `[CLIENT] Connected to server`
   - Should see: `[CLIENT] Message received: room_snapshot`
   - Should see: `[CLIENT] Message received: player_joined`
   - Should NOT see sprite 404 errors

2. **Check Server Logs** (on Render dashboard):
   - Should see: `[SERVER] Starting timer broadcast`
   - Should see: `[SERVER] Tick X - Broadcasting...`

3. **Test Multiplayer**:
   - Open two browser tabs
   - Both should see each other
   - Timers should update in real-time when sitting

---

## If Still Not Working

The issue is that your local code and deployed code are different. To fix:

1. Make sure you've committed ALL changes:

```bash
git status  # Check what's not committed
git add .
git commit -m "Latest working version"
git push
```

2. On Render dashboard:
   - Go to your service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete

3. Clear browser cache (Ctrl+Shift+R) when testing

---

## Current Code Status

Your local files have the fixes, but they need to be:

1. Committed to git
2. Pushed to GitHub
3. Deployed on Render

The deployed version is using old code from an earlier commit.
