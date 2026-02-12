// UI Components Index
// Export all UI components from a single file for easier imports

// Base components
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";

export { Input } from "./input";
export type { InputProps } from "./input";

export { Textarea } from "./textarea";
export type { TextareaProps } from "./textarea";

export { Label } from "./label";
export type { LabelProps } from "./label";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "./card";

export { Badge, badgeVariants } from "./badge";
export type { BadgeProps } from "./badge";

// Form components
export { Checkbox } from "./checkbox";
export type { CheckboxProps } from "./checkbox";

export { Switch } from "./switch";
export type { SwitchProps } from "./switch";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./select";

// Overlay components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./popover";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SimpleTooltip } from "./tooltip";

// Navigation components
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Display components
export { Avatar, AvatarImage, AvatarFallback, SimpleAvatar, getInitials } from "./avatar";

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonButton } from "./skeleton";

export { Progress, CircularProgress } from "./progress";

export { Spinner, LoadingOverlay, LoadingInline } from "./spinner";

// Layout components
export { Separator } from "./separator";

// Input components
export { Slider } from "./slider";

// Empty States
export {
  EmptyState,
  EmptyInvitations,
  EmptyGuests,
  EmptyRSVPs,
  EmptyEvents,
  EmptyMedia,
  EmptySearch,
  EmptyNotifications,
  NoData,
} from "./empty-state";

// Error Handling
export {
  ErrorBoundary,
  ErrorFallback,
  PageError,
  ApiError,
} from "./error-boundary";
