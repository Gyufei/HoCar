 "use client";
 
 import * as React from "react";
 import { ChevronDown } from "lucide-react";
 
 import { cn } from "@/lib/utils";
 
 const AccordionContext = React.createContext<{
   value: string | null;
   onValueChange: (value: string) => void;
 } | null>(null);
 
 const AccordionItemContext = React.createContext<{
   itemValue: string;
   isOpen: boolean;
 } | null>(null);
 
 function useAccordion() {
   const ctx = React.useContext(AccordionContext);
   if (!ctx) throw new Error("must be inside <Accordion>");
   return ctx;
 }
 
 function useAccordionItem() {
   const ctx = React.useContext(AccordionItemContext);
   if (!ctx) throw new Error("must be inside <AccordionItem>");
   return ctx;
 }
 
 function Accordion({
   type = "single",
   collapsible = true,
   defaultValue,
   children,
   className,
 }: {
   type?: "single";
   collapsible?: boolean;
   defaultValue?: string;
   children: React.ReactNode;
   className?: string;
 }) {
   const [value, setValue] = React.useState<string | null>(
     defaultValue ?? null,
   );
 
   const onValueChange = React.useCallback(
     (newValue: string) => {
       setValue((prev) =>
         prev === newValue && collapsible ? null : newValue,
       );
     },
     [collapsible],
   );
 
   return (
     <AccordionContext.Provider value={{ value, onValueChange }}>
       <div className={cn("divide-y divide-border rounded-xl border", className)}>
         {children}
       </div>
     </AccordionContext.Provider>
   );
 }
 
 function AccordionItem({
   value,
   children,
   className,
 }: {
   value: string;
   children: React.ReactNode;
   className?: string;
 }) {
   const { value: selectedValue } = useAccordion();
   const isOpen = selectedValue === value;
 
   return (
     <AccordionItemContext.Provider value={{ itemValue: value, isOpen }}>
       <div
         className={cn(className)}
         data-state={isOpen ? "open" : "closed"}
       >
         {children}
       </div>
     </AccordionItemContext.Provider>
   );
 }
 
 function AccordionTrigger({
   children,
   className,
 }: {
   children: React.ReactNode;
   className?: string;
 }) {
   const { onValueChange } = useAccordion();
   const { itemValue, isOpen } = useAccordionItem();
 
   return (
     <h3>
       <button
         type="button"
         onClick={() => onValueChange(itemValue)}
         className={cn(
           "flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted/30",
           className,
         )}
         data-state={isOpen ? "open" : "closed"}
       >
         <ChevronDown
           className={cn(
             "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
             isOpen && "rotate-180",
           )}
         />
         {children}
       </button>
     </h3>
   );
 }
 
 function AccordionContent({
   children,
   className,
 }: {
   children: React.ReactNode;
   className?: string;
 }) {
   const { isOpen } = useAccordionItem();
 
   return isOpen ? (
     <div className={cn("px-4 pb-4 pt-1", className)}>{children}</div>
   ) : null;
 }
 
 export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
