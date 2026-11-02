import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Wallet, Receipt, Handshake, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DealDialog, ExpenseDialog, IncomeDialog } from "./forms";

type Kind = "income" | "expense" | "deal" | null;
const Ctx = createContext<(k: Exclude<Kind, null>) => void>(() => {});
export const useQuickAdd = () => useContext(Ctx);

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Kind>(null);
  const navigate = useNavigate();
  const close = (o: boolean) => !o && setOpen(null);
  return (
    <Ctx.Provider value={setOpen}>
      {children}
      <div className="fixed bottom-5 right-5 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="h-14 rounded-full px-5 shadow-lg" aria-label="Quick add">
              <Plus className="h-5 w-5" /> <span className="hidden sm:inline">Quick add</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => setOpen("income")}>
              <Wallet className="text-positive" /> Add income
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen("expense")}>
              <Receipt className="text-negative" /> Add expense
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen("deal")}>
              <Handshake className="text-pipeline" /> Add new deal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/activity" })}>
              <ListChecks /> Log daily activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <IncomeDialog open={open === "income"} onOpenChange={close} />
      <ExpenseDialog open={open === "expense"} onOpenChange={close} />
      <DealDialog open={open === "deal"} onOpenChange={close} />
    </Ctx.Provider>
  );
}
