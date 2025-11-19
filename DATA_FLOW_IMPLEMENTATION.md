# Data Flow Architecture - Implementation Guide

## Overview

An interactive, animated Data Flow Architecture diagram has been implemented for the Data Architecture component. It features three distinct animation paths with keyboard controls, play/pause functionality, and interactive tooltips.

## What Was Implemented

### ✅ Completed Tasks

1. **Framer Motion Integration**
   - Installed `framer-motion` package for advanced animations
   - Location: [frontend/package.json](frontend/package.json)

2. **DataArchitectureContent Component**
   - Created comprehensive React component with Framer Motion animations
   - Location: [frontend/src/components/data-architecture/DataArchitectureContent.tsx](frontend/src/components/data-architecture/DataArchitectureContent.tsx)
   - **Features:**
     - 3 distinct animation paths with 2-second intervals between components
     - Smooth fade-in effects for all components
     - Flowing arrow animations
     - Keyboard shortcuts (1, 2, 3, Space)
     - Play/Pause controls
     - Step forward/backward navigation
     - Progress bar
     - Interactive tooltips (ready for AI integration)
     - Grey-out effect for inactive paths

3. **Component Page Integration**
   - Updated routing to display DataArchitectureContent
   - Location: [frontend/src/pages/ComponentPage.tsx](frontend/src/pages/ComponentPage.tsx)
   - When user navigates to Data Architecture → Content tab, the animated diagram displays

4. **MongoDB Content Entry**
   - Added "Data Flow Architecture" content to MongoDB
   - Collection: `content`
   - Component ID: `data-architecture`
   - Content ID: `data-flow-architecture`
   - Type: `html`
   - Interactive: Yes
   - Scripts:
     - [backend/scripts/add_data_flow_content.py](backend/scripts/add_data_flow_content.py)
     - [backend/add-data-flow-content.ps1](backend/add-data-flow-content.ps1)

5. **Image Directory Structure**
   - Created directory: `frontend/public/images/data-architecture/components/`
   - Added README with PowerPoint export instructions
   - Location: [frontend/public/images/data-architecture/components/README.md](frontend/public/images/data-architecture/components/README.md)

## Animation Paths

### Path C (Default) - Key: "1"
**High-Volume Query Path**
```
Pub/Sub → Data Hub (Buy) → Analytics
```
- Shows how high-volume queries are routed to specialized data stores
- Components: Pub/Sub → Data Hub (ODS, SDS, ADS) → Analytics

### Path A - Key: "2"
**Event-Driven Path**
```
Core → Events → Pub/Sub → Microservices
```
- Demonstrates event publishing from core system to microservices
- Components: Temenos Core → Events → Pub/Sub → Microservices (Holdings, Party)

### Path B - Key: "3"
**ETL Pipeline Path**
```
Core → File → ETL → Data Warehouse → Analytics
```
- Shows traditional ETL process for batch data processing
- Components: Temenos Core → File → ETL → Data Warehouse → Analytics

## User Controls

### Keyboard Shortcuts
- **`1`** - Play Path C (High-Volume Query)
- **`2`** - Play Path A (Event-Driven)
- **`3`** - Play Path B (ETL Pipeline)
- **`Space`** - Play/Pause current animation

### UI Controls
- **Play/Pause Button** - Start or pause the animation
- **Step Forward** - Manually advance one component
- **Step Back** - Manually go back one component
- **Reset** - Reset animation to beginning
- **Path Selection Buttons** - Switch between paths

### Visual Feedback
- **Progress Bar** - Shows animation completion percentage
- **Step Counter** - Displays current step / total steps
- **Grey-out Effect** - Inactive paths are dimmed during playback
- **Tooltips** - Hover over components for descriptions (AI integration ready)

## How to Test

### 1. Start the Application

**Backend:**
```powershell
cd backend
.\start-backend.ps1
```
- Backend will run on http://localhost:8000
- Verify health: http://localhost:8000/api/v1/health

**Frontend:**
```bash
cd frontend
npm run dev
```
- Frontend will run on http://localhost:3000

### 2. Navigate to Data Flow Architecture

1. Open http://localhost:3000 in your browser
2. Click on **"Data Architecture"** component card
3. You'll be on the **"Content"** tab by default
4. You should see the **"Data Flow Architecture"** diagram

### 3. Test Animation Paths

**Test Path C (Default):**
- Click the "Path 1 (Key: 1)" button or press `1` on keyboard
- Click the Play button or press `Space`
- Watch components fade in sequentially:
  - Pub/Sub appears first
  - Arrow animates to Data Hub
  - Data Hub appears with ODS, SDS, ADS
  - Arrow animates to Analytics
  - Analytics appears

**Test Path A:**
- Click the "Path 2 (Key: 2)" button or press `2`
- Click Play or press `Space`
- Observe: Core → Events → Pub/Sub → Microservices sequence

**Test Path B:**
- Click the "Path 3 (Key: 3)" button or press `3`
- Click Play or press `Space`
- Observe: Core → File → ETL → Data Warehouse → Analytics sequence

### 4. Test Controls

**Play/Pause:**
- Start an animation
- Press `Space` to pause
- Press `Space` again to resume

**Step Forward/Back:**
- Reset the animation
- Use the step forward button (⏭️) to advance one component at a time
- Use the step back button (⏮️) to go backward

**Path Switching:**
- Try switching paths while idle
- Verify you cannot switch paths during playback

**Grey-out Effect:**
- Start any path animation
- Watch components NOT in the current path become grey/dimmed

### 5. Test Tooltips

- Hover over any visible component
- A tooltip should appear with the component description
- Tooltips are positioned below the component
- Note: These are placeholder tooltips, ready for AI integration later

### 6. Test Keyboard Shortcuts

- Press `1` - Should switch to and play Path C
- Press `2` - Should switch to and play Path A
- Press `3` - Should switch to and play Path B
- Press `Space` - Should pause/resume

### 7. Verify Progress Tracking

- Watch the progress bar fill as animation plays
- Check the step counter updates correctly
- Verify completed state when animation finishes

## Next Steps: Adding Component Images

Currently, the diagram uses placeholder boxes with component labels. To replace with actual PowerPoint images:

### Option 1: Export Individual Components (Recommended)

1. Follow the guide in [frontend/public/images/data-architecture/components/README.md](frontend/public/images/data-architecture/components/README.md)
2. Export each component from `d:\data-architecture.pptx` as PNG
3. Save with exact filenames specified in the README
4. Refresh the page - images will automatically load

### Option 2: Use Full Diagram Image

1. Export the entire slide as a single high-resolution PNG
2. Update the component to use CSS clipping masks
3. This requires code modifications but is faster

### Option 3: Recreate with SVG

1. Recreate the diagram using SVG components in React
2. Most flexible but time-intensive
3. Best for production deployment

## File Structure

```
bsg-demo-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── data-architecture/
│   │   │       └── DataArchitectureContent.tsx  ← Main component
│   │   └── pages/
│   │       └── ComponentPage.tsx  ← Routing integration
│   ├── public/
│   │   └── images/
│   │       └── data-architecture/
│   │           └── components/  ← Place images here
│   │               └── README.md
│   └── package.json  ← Framer Motion dependency
├── backend/
│   ├── scripts/
│   │   └── add_data_flow_content.py  ← MongoDB seed script
│   └── add-data-flow-content.ps1  ← PowerShell runner
└── DATA_FLOW_IMPLEMENTATION.md  ← This file
```

## Technical Details

### Component Positioning

Components are positioned absolutely on a 1280x600px canvas:
- **Core System:** Left side (x: 50-400)
- **Middle Tier:** Center (x: 400-650)
- **Right Tier:** Right side (x: 800-1230)

Coordinates can be adjusted in [DataArchitectureContent.tsx:51-100](frontend/src/components/data-architecture/DataArchitectureContent.tsx#L51-L100)

### Animation Timing

- **Component fade-in:** 0.5 seconds
- **Interval between components:** 2 seconds
- **Arrow animation:** 1 second
- All timings configurable in [DataArchitectureContent.tsx:117-163](frontend/src/components/data-architecture/DataArchitectureContent.tsx#L117-L163)

### State Management

Uses React hooks:
- `useState` for path selection, playback state, visible components
- `useEffect` for keyboard event listeners
- `useCallback` for animation sequence control

### Tooltip Integration

Tooltips are ready for AI integration:
- Structure in place with hover detection
- `hoveredComponent` state tracks current hover
- Placeholder text can be replaced with AI-generated descriptions

## Troubleshooting

### Animation Not Playing
- Check browser console for errors
- Verify MongoDB content entry exists: http://localhost:8000/api/v1/components/data-architecture/content
- Ensure Framer Motion is installed: Check `node_modules/framer-motion`

### Keyboard Shortcuts Not Working
- Click on the diagram area to focus
- Check for browser extensions that might intercept key events
- Open browser console and check for JavaScript errors

### Images Not Loading
- Verify image files are in `frontend/public/images/data-architecture/components/`
- Check exact filenames match the component definitions
- Images must be PNG format
- Refresh browser cache (Ctrl+Shift+R)

### Components Out of Position
- Adjust coordinates in the `components` array in DataArchitectureContent.tsx
- Use browser DevTools to inspect element positions
- Consider using CSS Grid or Flexbox for more responsive layouts

## Future Enhancements

### Suggested Improvements:
1. **AI-Generated Tooltips**
   - Integrate with AI component for dynamic descriptions
   - Context-aware explanations based on selected path

2. **Mobile Responsiveness**
   - Adjust component positions for smaller screens
   - Touch controls for mobile devices
   - Swipe gestures for path switching

3. **Animation Presets**
   - Slow, Normal, Fast speed options
   - Custom timing controls
   - Loop mode

4. **Export Functionality**
   - Export animation as GIF or video
   - Screenshot current state
   - Share specific paths

5. **Accessibility**
   - Screen reader support
   - Keyboard navigation improvements
   - High contrast mode
   - Reduced motion option

6. **Data-Driven Configuration**
   - Store component positions in MongoDB
   - Admin UI to adjust layout
   - Path customization without code changes

## Support

For issues or questions:
1. Check browser console for errors
2. Review this implementation guide
3. Verify all files are in correct locations
4. Ensure both frontend and backend are running
5. Check MongoDB connection and content entry

---

**Implementation Date:** November 13, 2025
**Status:** Complete and Ready for Testing
**Next Step:** Export PowerPoint components as images
