# Component Library Documentation

## UI Components

### Button

Variants: `primary`, `secondary`, `ghost`, `destructive`
Sizes: `sm` (h-7), `md` (h-9), `lg` (h-11)
Features: `asChild` support, disabled state, loading spinner support

```tsx
<Button variant="primary" size="md" onClick={handler}>
  Click Me
</Button>

<Button variant="ghost" size="sm" asChild>
  <Link href="/page">Navigate</Link>
</Button>
```

### Card

Composable layout with: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description goes here</CardDescription>
  </CardHeader>
  <CardContent>Body content</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### Input

Text input with optional error state and label support.

```tsx
<Input
  placeholder="Enter name"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Select

Select dropdown with options array and error state.

```tsx
<Select
  options={[
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
  ]}
  value={selected}
  onChange={(v) => setSelected(v)}
/>
```

### Modal

Modal dialog with ESC close, overlay click close, and focus trap.

```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <h2>Modal Title</h2>
  <p>Content goes here</p>
</Modal>
```

## Builder Components

### PageBuilder

Core drag-and-drop page builder with 3-panel layout.

**Props:**
- `initialComponents?: BuilderComponent[]`
- `onSave?: (components: BuilderComponent[]) => void`
- `websiteName?: string`
- `pageName?: string`

**Features:**
- Undo/redo with 50-step history
- Viewport preview modes: Desktop (100%), Tablet (768px), Mobile (375px)
- Touch-friendly drag-and-drop with 8px activation constraint
- Auto-save every 30 seconds
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo), Delete (remove selected)
- AI Assistant panel: toggle between Properties and AI panel on desktop, dedicated mobile overlay
- Mobile: collapsible left/right/AI panels accessible via toggle buttons (slide-over panels)
- Desktop: expandable right panel (288px properties / 320px AI)

### ComponentPalette

Searchable, categorized component picker. Add components by clicking.

### ComponentPreview

Live preview renderer showing component in the canvas with selection highlighting.

### ComponentProperties

Two-tab inspector (Content/Style) for editing selected component properties.

**Style sections:**
- **Appearance**: backgroundColor, textColor, opacity
- **Typography**: fontSize, fontWeight, textAlign
- **Spacing**: padding, margin, width, height
- **Border**: borderRadius, borderWidth, borderColor, borderStyle

## Dashboard Analytics Components

### MetricCard

Displays a KPI with icon, value, and optional trend indicator.

```tsx
<MetricCard
  title="Total Users"
  value="727"
  change="+12.5%"
  trend="up"
  icon={Users}
  color="text-blue-600"
  bgColor="bg-blue-100 dark:bg-blue-900/30"
/>
```

### RevenueChartWidget

Area chart for revenue tracking using Recharts.

```tsx
<RevenueChartWidget
  data={[
    { month: 'Jan', revenue: 12400 },
    { month: 'Feb', revenue: 15800 },
  ]}
  title="Revenue Overview"
  description="Monthly recurring revenue trend"
/>
```

### BarChartWidget

Bar chart for comparative data visualization.

```tsx
<BarChartWidget
  data={[
    { day: 'Mon', value: 12 },
    { day: 'Tue', value: 19 },
  ]}
  dataKey="value"
  title="Weekly Signups"
  description="User signups by day"
  fillColor="#8b5cf6"
/>
```

### DonutChartWidget

Pie/donut chart with legend for distribution data.

```tsx
<DonutChartWidget
  data={[
    { name: 'Free', value: 420, color: '#71717a' },
    { name: 'Pro', value: 98, color: '#8b5cf6' },
  ]}
  title="Subscription Distribution"
  description="Users by plan type"
/>
```

### ActivityFeed

Timeline-style activity list with color-coded event types.

```tsx
<ActivityFeed
  activities={[
    { id: 1, user: 'John', action: 'Created website', time: '2 min ago', type: 'create' },
  ]}
  title="Recent Activity"
  description="Latest platform events"
/>
```

### StatRowList

Key metrics displayed as icon-labeled rows.

```tsx
<StatRowList
  stats={[
    { label: 'MRR', value: '$68,500', icon: TrendingUp, color: 'text-green-600' },
  ]}
  title="Key Metrics"
  description="Platform health indicators"
/>
```

### LoadingSkeleton

Reusable loading placeholder with variants: `metric`, `chart`, `list`, `table-row`.

```tsx
<LoadingSkeleton variant="metric" />
<LoadingSkeleton variant="chart" />
<LoadingSkeleton variant="list" count={5} />
```

### UserActivityWidget

Rich activity tracking with summary stats, time range filters, type filters, and sorting.

```tsx
<UserActivityWidget
  activities={[
    { id: '1', user: 'John', email: 'john@example.com', action: 'Created website', time: '2 min ago', timestamp: new Date(), type: 'create-site' },
  ]}
  title="User Activity"
  maxItems={10}
/>
```

**Features:**
- Summary bar: unique users, signups, publishes, upgrades
- Filter by type: all, signups, publishes, new sites, upgrades
- Time range: 24h, 7d, 30d, 90d
- Sortable by newest/oldest
- Color-coded type badges

### WebsiteStatsPanel

Comprehensive website creation metrics with charts, template stats, and KPI cards.

```tsx
<WebsiteStatsPanel
  stats={{
    totalSites: 1247,
    activeSites: 892,
    draftSites: 355,
    publishedThisWeek: 47,
    publishedThisMonth: 183,
    avgTimeToPublish: '8m',
    topTemplates: [
      { name: 'SaaS Landing', count: 312, color: '#3b82f6' },
      { name: 'Portfolio', count: 241, color: '#8b5cf6' },
    ],
    sitesByDay: [
      { day: 'Mon', created: 23, published: 15 },
      { day: 'Tue', created: 31, published: 19 },
    ],
    trend: [
      { month: 'Jan', sites: 180 },
      { month: 'Feb', sites: 220 },
    ],
    changes: { totalSitesChange: '+12%', activeSitesChange: '+8%', publishedChange: '+15%', trend: 'up' },
  }}
/>
```

**Features:**
- 4 KPI cards: total sites, active sites, published MTD, avg time to publish
- Weekly bar chart (created vs published) or monthly line chart
- Top templates breakdown
- Quick stats: draft count, published this week, avg created/day
- Change indicators with trend arrows

### ConversionRateWidget

Conversion funnel visualization with multiple view modes and drop-off analysis.

```tsx
<ConversionRateWidget
  funnelSteps={[
    { name: 'Visitors', value: 10000, color: '#3b82f6' },
    { name: 'Signups', value: 2500, color: '#6366f1' },
    { name: 'Activated', value: 1200, color: '#8b5cf6' },
    { name: 'Published', value: 480, color: '#a855f7' },
    { name: 'Paid', value: 120, color: '#c084fc' },
  ]}
  trends={[
    { month: 'Jan', rate: 1.8 },
    { month: 'Feb', rate: 2.1 },
  ]}
/>
```

**Features:**
- 3 view modes: Funnel (proportional bars), Bar (conversion rates), Trend (monthly)
- Overall conversion rate display
- Drop-off alerts for steps with >30% loss
- Step-by-step conversion percentages
- Color-coded legend

## AI Builder Components

### AIContentPanel

AI-powered content generation panel with 4 tabs: Generate, Copy, SEO, Templates.

```tsx
<AIContentPanel
  selectedComponent={selectedComponent}
  onInsertSection={(section) => addComponent(section)}
  onApplyCopy={(config) => updateComponentConfig(config)}
/>
```

**Tabs:**

| Tab | Description |
|-----|-------------|
| **Generate** | Generate website sections (hero, features, testimonials, pricing, CTA, FAQ) from text prompts with tone selection and quick-prompt buttons |
| **Copy** | AI copy suggestions for headings, descriptions, and CTAs based on selected component context |
| **SEO** | SEO meta tag generation from page title, description, keywords, and industry |
| **Templates** | Industry-aware template recommendations with match scores and one-click insertion |

**Features:**
- Connected to Ollama AI (with mock fallback when no backend)
- 6 quick-prompt section types with one-click generation
- Tone selection: professional, casual, playful, authoritative
- Copy suggestions contextual to selected component type
- SEO meta generation with copy-as-HTML
- Template recommendations by industry (8 industries) with match scores
- History tab tracking all generations

## Theme Provider

Dark mode support via class-based theme switching with `system` fallback.

```tsx
const { theme, resolvedTheme, setTheme } = useTheme()
// theme: 'light' | 'dark' | 'system'
// resolvedTheme: 'light' | 'dark' (computed actual theme)
setTheme('dark')
```

### ThemeToggle Component

```tsx
<ThemeToggle size="sm" />
<ThemeToggle size="md" />
```

## Design Tokens

- **Neutral palette**: Zinc (50-950)
- **Accents**: Blue (#3b82f6), Purple (#8b5cf6), Green (#22c55e), Amber (#f59e0b), Red (#ef4444)
- **Borders**: `border-zinc-200 dark:border-zinc-800`
- **Fonts**: Geist Sans (body), Geist Mono (code)
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

## Accessibility

All interactive components support:
- Keyboard navigation (Tab, Enter, Space, Escape)
- ARIA labels on icons and buttons
- Focus ring visibility (`focus:ring-2 focus:ring-zinc-400`)
- Semantic HTML structure
- Color contrast compliant with WCAG 2.1 AA

## Responsive Design

- Mobile-first approach
- Sidebar hidden below lg (1024px) with overlay toggle
- Builder panels collapsible on mobile via slide-over panels
- Chart containers use `ResponsiveContainer` from Recharts
- Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
