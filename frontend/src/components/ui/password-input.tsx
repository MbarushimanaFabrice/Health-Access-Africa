import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, type = "password", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        {label && <label htmlFor={inputId} className="block text-sm font-medium">{label}</label>}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : type}
            className={cn("pr-10", className)}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";