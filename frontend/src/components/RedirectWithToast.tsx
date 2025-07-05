import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const RedirectWithToast = ({ to, message }: { to: string; message: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: message,
      variant: "default",
    });
    navigate(to, { replace: true });
  }, [navigate, to, message]);

  return null;
};

export default RedirectWithToast;
