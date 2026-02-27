import { toast } from "sonner";

export function useActionToast() {
  const handleResult = (
    result: { error: string } | { success: true },
    successMessage: string,
  ) => {
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(successMessage);
    }
  };

  return { handleResult };
}
