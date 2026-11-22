export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  isPlaceholder?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    title: "Core Operations",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: "LayoutDashboard",
      },
      {
        title: "Orders",
        href: "/orders",
        icon: "ShoppingBag",
        badge: "Live",
      },
      {
        title: "Pre-Orders",
        href: "/pre-orders",
        icon: "Clock",
        isPlaceholder: true,
      },
      {
        title: "Custom Orders",
        href: "/custom-orders",
        icon: "Sparkles",
        isPlaceholder: true,
      },
      {
        title: "Field Operations",
        href: "/field-operations",
        icon: "MapPin",
        badge: "Dispatch",
      },
    ],
  },
  {
    title: "Network & Distribution",
    items: [
      {
        title: "Dealerships",
        href: "/dealerships",
        icon: "Building2",
        isPlaceholder: true,
      },
      {
        title: "Sales Representatives",
        href: "/sales-reps",
        icon: "Users2",
        isPlaceholder: true,
      },
      {
        title: "Outlets",
        href: "/outlets",
        icon: "Store",
        isPlaceholder: true,
      },
      {
        title: "Products",
        href: "/products",
        icon: "Package",
        isPlaceholder: true,
      },
    ],
  },
  {
    title: "Governance & Management",
    items: [
      {
        title: "Targets & Analytics",
        href: "/analytics",
        icon: "BarChart3",
        isPlaceholder: true,
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: "Bell",
        isPlaceholder: true,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: "Settings",
        isPlaceholder: true,
      },
    ],
  },
];
