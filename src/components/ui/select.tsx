import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("flex h-11 w-fit items-center justify-between gap-2 rounded-[var(--radius)] border border-input bg-background/75 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDownIcon className="size-4 opacity-50" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}
function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content data-slot="select-content" position={position} className={cn("relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-y-auto rounded-[var(--radius)] border border-border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in", position === "popper" && "translate-y-1", className)} {...props}><SelectScrollUpButton /><SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>{children}</SelectPrimitive.Viewport><SelectScrollDownButton /></SelectPrimitive.Content></SelectPrimitive.Portal>;
}
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn("relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-2 pr-8 pl-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><span className="absolute right-2 flex size-3.5 items-center justify-center"><SelectPrimitive.ItemIndicator><CheckIcon className="size-4" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
}
function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) { return <SelectPrimitive.ScrollUpButton className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><ChevronUpIcon className="size-4" /></SelectPrimitive.ScrollUpButton>; }
function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) { return <SelectPrimitive.ScrollDownButton className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><ChevronDownIcon className="size-4" /></SelectPrimitive.ScrollDownButton>; }

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
