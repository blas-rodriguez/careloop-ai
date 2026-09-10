import { RotateCcw } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { resetDemoWorkspace } from "@/lib/actions/workspace";

export function DemoResetForm() {
  return (
    <form
      action={resetDemoWorkspace}
      className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4"
    >
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 shrink-0 text-amber-700" size={19} />
        <div>
          <p className="text-sm font-semibold text-amber-950">
            Restore fictional demo
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-900/75">
            Replaces every patient, consultation, call result, and appointment
            in your account with the original fictional scenario. Other accounts
            are never affected.
          </p>
        </div>
      </div>
      <label className="my-4 flex items-start gap-2 text-xs font-medium text-amber-950">
        <input
          name="confirmation"
          value="RESTORE_DEMO"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 accent-amber-700"
        />
        I understand that my current workspace records will be replaced.
      </label>
      <SubmitButton>Restore demo workspace</SubmitButton>
    </form>
  );
}
